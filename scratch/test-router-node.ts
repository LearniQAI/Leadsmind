import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRouterAudit() {
  console.log("🚀 STARTING MULTI-BRANCH ROUTER AUDIT...");
  
  // 1. Setup Environment
  const { data: workspace } = await supabase.from('workspaces').select('id').limit(1).single();
  if (!workspace) throw new Error("No workspace found for testing");
  const workspaceId = workspace.id;

  // 2. Create Test Workflow with Router
  console.log("📝 Creating Workflow with Multi-Branch Router...");
  const { data: workflow } = await supabase
    .from('workflows')
    .insert({
      workspace_id: workspaceId,
      name: "ROUTER AUDIT",
      trigger_type: 'contact_created',
      is_active: true
    })
    .select()
    .single();

  // ROUTER CONFIG: 
  // Branch 1: score > 70 -> apply_tag "VIP"
  // Branch 2: score > 30 -> apply_tag "WARM"
  // Default: apply_tag "COLD"
  const routerBranches = [
    {
      name: "Gold Path",
      conditions: [{ field: 'lead_score', operator: 'greater_than', value: '70' }],
      steps: [{ type: 'apply_tag', config: { tag: 'router-vip' } }]
    },
    {
      name: "Silver Path",
      conditions: [{ field: 'lead_score', operator: 'greater_than', value: '30' }],
      steps: [{ type: 'apply_tag', config: { tag: 'router-warm' } }]
    },
    {
      name: "Fallback Path",
      is_default: true,
      conditions: [],
      steps: [{ type: 'apply_tag', config: { tag: 'router-cold' } }]
    }
  ];

  await supabase.from('workflow_steps').insert([
    {
      workflow_id: workflow.id,
      workspace_id: workspaceId,
      position: 1,
      type: 'route',
      config: { branches: routerBranches }
    }
  ]);

  // 3. Test Cases
  const testCases = [
    { name: "Gold Test (score 85)", score: 85, expectedTag: 'router-vip', expectedBranch: 'Gold Path' },
    { name: "Silver Test (score 45)", score: 45, expectedTag: 'router-warm', expectedBranch: 'Silver Path' },
    { name: "Default Test (score 10)", score: 10, expectedTag: 'router-cold', expectedBranch: 'Fallback Path' },
  ];

  for (const tc of testCases) {
    console.log(`\n🧪 Running: ${tc.name}`);
    
    // Create contact
    const { data: contact } = await supabase
      .from('contacts')
      .insert({
        workspace_id: workspaceId,
        email: `router-${Date.now()}-${tc.score}@test.com`,
        lead_score: tc.score
      })
      .select()
      .single();

    // Trigger
    const { triggerWorkflows } = await import('../src/lib/automation/executor');
    await triggerWorkflows(workspaceId, 'contact_created', contact.id);

    // Wait for engine
    await new Promise(r => setTimeout(r, 2000));

    // Verify
    const { data: updatedContact } = await supabase.from('contacts').select('tags').eq('id', contact.id).single();
    const { data: execution } = await supabase
      .from('workflow_executions')
      .select('*, logs:workflow_step_logs(*)')
      .eq('contact_id', contact.id)
      .single();

    const chosenBranch = execution.logs[0]?.metadata?.chosen_branch;
    const hasTag = updatedContact.tags?.includes(tc.expectedTag);

    if (hasTag && chosenBranch === tc.expectedBranch) {
      console.log(`✅ MATCHED: ${chosenBranch} (Tag: ${tc.expectedTag})`);
    } else {
      console.error(`❌ FAILED: Wanted ${tc.expectedBranch}/${tc.expectedTag}, got ${chosenBranch}/${updatedContact.tags}`);
    }
  }

  console.log("\n🏁 --- ROUTER AUDIT COMPLETE ---");
}

runRouterAudit().catch(console.error);
