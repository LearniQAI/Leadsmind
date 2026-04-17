import { createClient } from '@/lib/supabase/server';
import { triggerWorkflows } from '@/lib/automation/executor';
import { NextResponse } from 'next/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PHASE 4 LOGIC AUDIT ROUTE
 * This route programmatically verifies that the linear automation engine:
 * 1. Correctly registers workflows.
 * 2. Correctly triggers on contact creation.
 * 3. Correctly pauses on 'WAIT' steps with state context.
 */
export async function GET() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId();
  
  if (!workspaceId) {
    return NextResponse.json({ error: "Unauthorized or no workspace" }, { status: 401 });
  }

  const results: any = {
    workspaceId,
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // 1. SETUP TEST WORKFLOW
    const testName = `E2E-AUDIT-${Date.now()}`;
    const { data: workflow, error: wfError } = await supabase
      .from('workflows')
      .insert({
        workspace_id: workspaceId,
        name: testName,
        trigger_type: 'contact_created',
        is_active: true
      })
      .select()
      .single();

    if (wfError) throw new Error(`Workflow Creation Failed: ${wfError.message}`);

    await supabase.from('workflow_steps').insert([
      {
        workflow_id: workflow.id,
        workspace_id: workspaceId,
        position: 1,
        type: 'add_tag',
        config: { tag: 'e2e-verified' }
      },
      {
        workflow_id: workflow.id,
        workspace_id: workspaceId,
        position: 2,
        type: 'wait',
        config: { delayValue: 10, delayUnit: 'minutes' }
      }
    ]);

    results.tests.push({ name: "Workflow Setup", status: "PASS" });

    // 2. TRIGGER FLOW (Mock Lead)
    const testEmail = `audit-${Date.now()}@test.com`;
    const { data: contact, error: cError } = await supabase
      .from('contacts')
      .insert({
        workspace_id: workspaceId,
        first_name: "Audit",
        last_name: "Robot",
        email: testEmail
      })
      .select()
      .single();

    if (cError) throw new Error(`Contact Injection Failed: ${cError.message}`);

    // Call Global Trigger
    await triggerWorkflows(workspaceId, 'contact_created', contact.id);
    results.tests.push({ name: "Lead Submission Trigger", status: "PASS" });

    // 3. AUDIT ENGINE STATE
    // Wait for async processing to settle
    await new Promise(r => setTimeout(r, 1000));

    const { data: execution } = await supabase
      .from('workflow_executions')
      .select('*, logs:workflow_step_logs(*)')
      .eq('contact_id', contact.id)
      .single();

    if (execution) {
      results.execution = {
        status: execution.status,
        currentStep: execution.current_step,
        logCount: execution.logs.length,
        context: execution.context
      };

      // Check step 1
      const step1 = execution.logs.find((l: any) => l.step_id && l.status === 'completed');
      if (step1) results.tests.push({ name: "Step 1 (Add Tag) Execution", status: "PASS" });
      else results.tests.push({ name: "Step 1 (Add Tag) Execution", status: "FAIL" });

      // Check step 2 wait state
      if (execution.status === 'running' && execution.context?.resume_at) {
        results.tests.push({ name: "Step 2 (Wait) Pause Logic", status: "PASS" });
      } else {
         results.tests.push({ name: "Step 2 (Wait) Pause Logic", status: "FAIL" });
      }
    } else {
        results.tests.push({ name: "Execution Record Check", status: "FAIL" });
    }

    // CLEANUP (Optional - keeping for record if fail, but let's delete if pass)
    if (results.tests.every((t: any) => t.status === "PASS")) {
        await supabase.from('workflows').delete().eq('id', workflow.id);
        await supabase.from('contacts').delete().eq('id', contact.id);
        results.cleanup = "Successful";
    }

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ 
        success: false, 
        error: error.message,
        partialResults: results 
    }, { status: 500 });
  }
}
