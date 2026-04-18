import { createServerClient } from "@/lib/supabase/server";
import { AutomationActions } from "./actions_registry";

/**
 * Trigger point for all automations.
 * Fetches all active linear workflows for the given trigger type.
 */
export async function triggerWorkflows(workspaceId: string, triggerType: string, contactId: string) {
  const supabase = await createServerClient();
  
  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("trigger_type", triggerType)
    .eq("is_active", true);

  if (!workflows || workflows.length === 0) return;

  for (const workflow of workflows) {
    await startWorkflowExecution(workflow, contactId);
  }
}

/**
 * Initializes a new execution record and starts the first step.
 */
async function startWorkflowExecution(workflow: any, contactId: string) {
  const supabase = await createServerClient();

  // 1. Create Execution Record
  const { data: execution, error } = await supabase
    .from("workflow_executions")
    .insert({
      workspace_id: workflow.workspace_id,
      workflow_id: workflow.id,
      contact_id: contactId,
      status: 'running',
      current_step: 1
    })
    .select()
    .single();

  if (error) {
    console.error("[executor] Failed to create execution:", error);
    return;
  }

  // 2. Start Sequential Processing
  await processNextStep(execution.id);
}

/**
 * Core loop: Fetches current step, executes it, and decides whether to continue.
 */
export async function processNextStep(executionId: string) {
  const supabase = await createServerClient();

  // 1. Fetch Execution & Current Step
  const { data: execution } = await supabase
    .from("workflow_executions")
    .select("*, workflow:workflows(*)")
    .eq("id", executionId)
    .single();

  if (!execution || execution.status !== 'running') return;

  // 1.5 Goal Check: Stop sequence if contact conversion goal is met
  const isGoalAchieved = await checkGoalAchieved(execution.workflow, execution.contact_id);
  if (isGoalAchieved) {
    await supabase.from("workflow_executions").update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      context: { ...execution.context, termination_reason: 'goal_achieved' }
    }).eq("id", executionId);
    
    console.log(`[executor] Termination: Contact ${execution.contact_id} met goal for workflow ${execution.workflow_id}`);
    return;
  }

  const currentStepPos = execution.current_step;
  const { data: step } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", execution.workflow_id)
    .eq("position", currentStepPos)
    .single();

  // If no more steps, we're done
  if (!step) {
    await supabase.from("workflow_executions").update({ 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    }).eq("id", executionId);
    return;
  }

  // LOGIC FIX: Check if we are resuming from a wait
  if (step.type === 'wait' && execution.context?.resume_at) {
    const resumeAt = new Date(execution.context.resume_at);
    const now = new Date();
    
    // If now is past resumeAt, we have finished the wait!
    if (now >= resumeAt) {
      // Clear the resume_at and increment step
      await supabase.from("workflow_executions").update({
        current_step: currentStepPos + 1,
        context: { ...execution.context, resume_at: null }
      }).eq("id", executionId);
      
      // Call again to start the next action
      await processNextStep(executionId);
      return;
    }
  }

  // 2. Create Step Log
  const { data: log } = await supabase
    .from("workflow_step_logs")
    .insert({
      execution_id: executionId,
      workspace_id: execution.workspace_id,
      step_id: step.id,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  try {
    // 3. Execute the Action
    if (step.type === 'wait') {
      // If we already have a resume_at but we reached here, it means the wait isn't over yet
      if (execution.context?.resume_at) {
         return; // Still waiting, don't re-calculate
      }

      const { delayValue = 1, delayUnit = 'minutes' } = step.config;
      const resumeAt = new Date();
      if (delayUnit === 'minutes') resumeAt.setMinutes(resumeAt.getMinutes() + Number(delayValue));
      else if (delayUnit === 'hours') resumeAt.setHours(resumeAt.getHours() + Number(delayValue));
      else if (delayUnit === 'days') resumeAt.setDate(resumeAt.getDate() + Number(delayValue));

      // Pause execution
      await supabase.from("workflow_executions").update({ 
        status: 'running', // Keep running but we wait for cron
        context: { ...execution.context, resume_at: resumeAt.toISOString() }
      }).eq("id", executionId);

      await supabase.from("workflow_step_logs").update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      }).eq("id", log.id);

      // Terminate synchronous run (will be resumed by cron/background job)
      return;
    }

    // Standard Actions (Email, SMS, Tags, etc)
    const handler = (AutomationActions as any)[step.type];
    if (handler) {
      await handler(execution.workspace_id, execution.contact_id, step.config);
    }

    // 4. Update Log & Move to Next
    await supabase.from("workflow_step_logs").update({ 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    }).eq("id", log.id);

    await supabase.from("workflow_executions").update({ 
      current_step: currentStepPos + 1 
    }).eq("id", executionId);

    // Continue recursively for synchronous steps
    await processNextStep(executionId);

  } catch (err: any) {
    console.error(`[executor] Step failed (${step.type}):`, err);
    
    await supabase.from("workflow_step_logs").update({ 
      status: 'failed', 
      error_message: err.message,
      completed_at: new Date().toISOString() 
    }).eq("id", log.id);

    // Stop execution on failure (or implement retry logic here)
    await supabase.from("workflow_executions").update({ 
      status: 'failed', 
      error_message: `Step ${currentStepPos} failed: ${err.message}` 
    }).eq("id", executionId);
  }
}

/**
 * Utility to check if a specific goal has been met by a contact.
 */
export async function checkGoalAchieved(workflow: any, contactId: string): Promise<boolean> {
  if (!workflow?.goal_event_type) return false;

  const supabase = await createServerClient();

  switch (workflow.goal_event_type) {
    case 'appointment_booked':
      // Goal met if contact has any appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('contact_id', contactId)
        .limit(1);
      return (appointments?.length ?? 0) > 0;

    case 'invoice_paid':
      // Goal met if contact has any paid invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('contact_id', contactId)
        .eq('status', 'paid')
        .limit(1);
      return (invoices?.length ?? 0) > 0;

    default:
      return false;
  }
}

/**
 * Event-driven goal checker. 
 * Should be called whenever a "conversion" event happens in the system.
 * Terminates any active workflows for the contact that have this goal type.
 */
export async function checkActiveWorkflowGoals(workspaceId: string, contactId: string, eventType: string) {
  const supabase = await createServerClient();

  // Find all ACTIVE executions for this contact in this workspace that have this goal type
  const { data: executions } = await supabase
    .from('workflow_executions')
    .select(`
      *,
      workflow:workflows!inner(*)
    `)
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .eq('status', 'running')
    .eq('workflow.goal_event_type', eventType);

  if (!executions || executions.length === 0) return;

  for (const execution of executions) {
    // Terminate the workflow
    await supabase.from('workflow_executions').update({
      status: 'completed',
      context: { 
        ...execution.context, 
        terminated_due_to_goal: true,
        goal_type: eventType,
        terminated_at: new Date().toISOString()
      },
      completed_at: new Date().toISOString()
    }).eq('id', execution.id);

    // Log the termination in step logs for visibility
    await supabase.from('workflow_step_logs').insert({
      execution_id: execution.id,
      workspace_id: workspaceId,
      status: 'skipped',
      error_message: `Workflow terminated: Goal '${eventType}' met.`,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  }
}
