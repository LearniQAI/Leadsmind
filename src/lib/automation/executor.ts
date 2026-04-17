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
