import { createServerClient } from "@/lib/supabase/server";
import { AutomationActions } from "./actions_registry";
import { isWithinBusinessHours, nextWindowOpen, BusinessHoursConfig } from "./business_hours";

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

  if (error || !execution) {
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

  // ── LOGIC: Check if we are resuming from a business-hours hold ──────────────
  if (execution.context?.held_until) {
    const heldUntil = new Date(execution.context.held_until);
    const now = new Date();
    if (now < heldUntil) {
      // Not yet time — leave the hold in place, the cron will retry
      return;
    }
    // Clear held_until before executing the step
    await supabase.from("workflow_executions").update({
      context: { ...execution.context, held_until: null }
    }).eq("id", executionId);
    // Re-read fresh context (optimistic: proceed directly)
  }

  // ── LOGIC: Check if we are resuming from a wait ──────────────────────────────
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

  // Safe helper — avoids crashing on log.id if the insert returned null
  const logId: string | null = log?.id ?? null;
  const updateLog = (patch: Record<string, unknown>) =>
    logId ? supabase.from("workflow_step_logs").update(patch).eq("id", logId) : Promise.resolve();

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

      await updateLog({ status: 'completed', completed_at: new Date().toISOString() });

      // Terminate synchronous run (will be resumed by cron/background job)
      return;
    }

    // ── BUSINESS HOURS CHECK (send_email / send_sms only) ────────────────────
    if (step.type === 'send_email' || step.type === 'send_sms') {
      const bhConfig: BusinessHoursConfig | null = step.business_hours ?? null;

      if (bhConfig?.enabled) {
        // Fetch the contact's timezone
        const { data: contactRow } = await supabase
          .from("contacts")
          .select("timezone")
          .eq("id", execution.contact_id)
          .single();

        const contactTimezone: string | null = contactRow?.timezone ?? null;

        if (!isWithinBusinessHours(bhConfig, contactTimezone)) {
          // Outside window — hold and reschedule
          const nextOpen = nextWindowOpen(bhConfig, contactTimezone);

          console.log(
            `[executor] Step ${step.type} held until ${nextOpen.toISOString()} ` +
            `for contact ${execution.contact_id}`
          );

          // Log the step as 'held'
          await updateLog({
            status: 'held',
            completed_at: new Date().toISOString(),
            error_message: `Outside business hours. Scheduled for ${nextOpen.toISOString()}`
          });

          // Store held_until in the execution context; cron will wake it later
          await supabase.from("workflow_executions").update({
            context: {
              ...execution.context,
              held_until: nextOpen.toISOString()
            }
          }).eq("id", executionId);

          // Stop synchronous processing — poll route will resume
          return;
        }
      }
    }
    // ── END BUSINESS HOURS CHECK ─────────────────────────────────────────────

    // Standard Actions (Email, SMS, Tags, etc)
    const handler = (AutomationActions as any)[step.type];
    if (handler) {
      await handler(execution.workspace_id, execution.contact_id, step.config);
    }

    // 4. Update Log & Move to Next
    await updateLog({ status: 'completed', completed_at: new Date().toISOString() });

    await supabase.from("workflow_executions").update({ 
      current_step: currentStepPos + 1 
    }).eq("id", executionId);

    // Continue recursively for synchronous steps
    await processNextStep(executionId);

  } catch (err: any) {
    console.error(`[executor] Step failed (${step.type}):`, err);
    
    await updateLog({ status: 'failed', error_message: err.message, completed_at: new Date().toISOString() });

    // Stop execution on failure (or implement retry logic here)
    await supabase.from("workflow_executions").update({ 
      status: 'failed', 
      error_message: `Step ${currentStepPos} failed: ${err.message}` 
    }).eq("id", executionId);
  }
}
