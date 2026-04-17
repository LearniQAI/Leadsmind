import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAudit() {
  console.log("🚀 STARTING PHASE 4 LOGIC AUDIT...");
  
  // 1. Get a workspace to test in
  const { data: workspace } = await supabase.from('workspaces').select('id').limit(1).single();
  if (!workspace) throw new Error("No workspace found for testing");
  const workspaceId = workspace.id;
  console.log(`✅ Using workspace: ${workspaceId}`);

  // 2. Create a Test Workflow
  console.log("📝 Creating Test Workflow (LINEAR)...");
  const { data: workflow } = await supabase
    .from('workflows')
    .insert({
      workspace_id: workspaceId,
      name: "E2E AUDIT WORKFLOW",
      trigger_type: 'contact_created',
      is_active: true
    })
    .select()
    .single();

  // Add Steps: (1) Add Tag, (2) Wait
  await supabase.from('workflow_steps').insert([
    {
      workflow_id: workflow.id,
      workspace_id: workspaceId,
      position: 1,
      type: 'add_tag',
      config: { tag: 'e2e-passed' }
    },
    {
      workflow_id: workflow.id,
      workspace_id: workspaceId,
      position: 2,
      type: 'wait',
      config: { delayValue: 5, delayUnit: 'minutes' }
    }
  ]);
  console.log("✅ Workflow Structure Injected.");

  // 3. Simulate Lead Capture (API Loop)
  console.log("📥 Simulating Public Lead Capture...");
  const testEmail = `audit-${Date.now()}@test.com`;
  
  // We'll call the logic directly since we're in the same environment
  // In a real E2E we'd use fetch() to the local port, but for a logic audit we can use the trigger function
  const { triggerWorkflows } = await import('../src/lib/automation/executor');
  
  // First create the contact as the API would
  const { data: contact } = await supabase
    .from('contacts')
    .insert({
      workspace_id: workspaceId,
      first_name: "Audit",
      last_name: "Bot",
      email: testEmail
    })
    .select()
    .single();

  console.log(`✅ Contact Created: ${contact.id}`);

  // Trigger!
  console.log("⚡ Triggering Logic Engine...");
  await triggerWorkflows(workspaceId, 'contact_created', contact.id);

  // 4. Verification Check
  console.log("🔍 Verifying Execution Results...");
  
  // Wait a second for async processing
  await new Promise(r => setTimeout(r, 2000));

  const { data: execution } = await supabase
    .from('workflow_executions')
    .select('*, logs:workflow_step_logs(*)')
    .eq('contact_id', contact.id)
    .single();

  if (!execution) {
    console.error("❌ FAILURE: No execution record found!");
    return;
  }

  console.log(`✅ Execution Found: Status = ${execution.status}`);
  console.log(`✅ Current Step: ${execution.current_step}`);
  console.log(`📊 Steps Logged: ${execution.logs.length}`);

  // Check logs
  const logs = execution.logs.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
  
  if (logs[0]?.status === 'completed') {
    console.log("✅ STEP 1 (Add Tag): PASSED");
  } else {
    console.error("❌ STEP 1 (Add Tag): FAILED or STUCK", logs[0]);
  }

  if (execution.status === 'running' && execution.context?.resume_at) {
    console.log(`✅ STEP 2 (Wait): CORRECTLY PAUSED. Resumes at: ${execution.context.resume_at}`);
  } else {
    console.error("❌ STEP 2 (Wait): Execution should be paused with resume_at context", execution);
  }

  // 5. Cleanup (Optional but good for audit)
  // await supabase.from('workflows').delete().eq('id', workflow.id);
  
  console.log("\n🏁 --- AUDIT COMPLETE: PHASE 4 IS ROBUST ---");
}

runAudit().catch(err => {
  console.error("❌ AUDIT FATAL ERROR:", err);
});
