'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Workflows (Linear) ---
export async function getWorkflows(workspaceId: string) {
  const supabase = await createClient();
  
  // Fetch workflows with aggregate counts
  const { data: workflows, error } = await supabase
    .from('workflows')
    .select(`
      *,
      steps_count:workflow_steps(count),
      execution_count:workflow_executions(count),
      executions:workflow_executions(completed_at)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Format data for the dashboard
  return workflows.map(wf => ({
    ...wf,
    steps_count: wf.steps_count?.[0]?.count || 0,
    execution_count: wf.execution_count?.[0]?.count || 0,
    last_run_at: wf.executions?.filter((e: any) => e.completed_at)
      .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]?.completed_at
  }));
}

export async function getWorkflowById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createWorkflow(workspaceId: string, name: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('workflows')
    .insert({
      workspace_id: workspaceId,
      name,
      trigger_type: 'contact_created',
      trigger_config: {},
      is_active: false
    })
    .select('*')
    .single();

  if (error) throw error;
  
  revalidatePath('/automations');
  return data;
}

export async function updateWorkflowStatus(id: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workflows')
      .update({ is_active: isActive })
      .eq('id', id);
  
    if (error) return { success: false, error: error.message };
    revalidatePath('/automations');
    return { success: true };
}

export async function duplicateWorkflow(id: string) {
    const supabase = await createClient();
    
    // Get source workflow
    const { data: source } = await supabase.from('workflows').select('*').eq('id', id).single();
    const { data: steps } = await supabase.from('workflow_steps').select('*').eq('workflow_id', id);

    if (!source) return { success: false, error: "Workflow not found" };

    // Create new workflow
    const { data: newWf, error: wfErr } = await supabase
        .from('workflows')
        .insert({
            workspace_id: source.workspace_id,
            name: `${source.name} (Copy)`,
            trigger_type: source.trigger_type,
            trigger_config: source.trigger_config,
            is_active: false
        })
        .select()
        .single();

    if (wfErr) return { success: false, error: wfErr.message };

    // Create steps
    if (steps && steps.length > 0) {
        const newSteps = steps.map(s => ({
            workflow_id: newWf.id,
            workspace_id: s.workspace_id,
            position: s.position,
            type: s.type,
            config: s.config
        }));
        await supabase.from('workflow_steps').insert(newSteps);
    }

    revalidatePath('/automations');
    return { success: true };
}


export async function updateWorkflow(id: string, updates: any) {
  const supabase = await createClient();
  
  const { nodes, edges, ...cleanUpdates } = updates;

  // 1. Update basic fields if they exist
  if (Object.keys(cleanUpdates).length > 0) {
    const { error } = await supabase
      .from('workflows')
      .update(cleanUpdates)
      .eq('id', id);
    if (error) throw error;
  }

  // 2. Sync Graph if nodes/edges are provided
  if (nodes && edges) {
    await syncWorkflowCanvas(id, nodes, edges);
  }

  revalidatePath('/automations');
  revalidatePath(`/automations/${id}/edit`);
  return { success: true };
}

export async function syncWorkflowCanvas(workflowId: string, nodes: any[], edges: any[]) {
  const supabase = await createClient();

  // 1. Get current workspace_id
  const { data: wf } = await supabase.from('workflows').select('workspace_id').eq('id', workflowId).single();
  if (!wf) throw new Error("Workflow not found");

  // 2. Sync Steps (Nodes)
  const steps = nodes.map((node: any, index: number) => {
    // Check if node.id is a valid UUID (UUIDs are 36 chars)
    const isUuid = node.id.length === 36 && node.id.includes('-');
    
    return {
      id: isUuid ? node.id : undefined,
      workflow_id: workflowId,
      workspace_id: wf.workspace_id,
      type: node.type,
      config: { ...node.data, _canvas_node_id: node.id }, // Tag for mapping
      position: index + 1,
      canvas_x: node.position.x,
      canvas_y: node.position.y,
    };
  });

  // Clean Slate for edges and steps to avoid foreign key conflicts or orphans
  await supabase.from('workflow_edges').delete().eq('workflow_id', workflowId);
  await supabase.from('workflow_steps').delete().eq('workflow_id', workflowId);

  // Insert Steps
  const { data: insertedSteps, error: stepErr } = await supabase
    .from('workflow_steps')
    .insert(steps)
    .select();

  if (stepErr) throw stepErr;

  // 3. Map step IDs (React Flow IDs to DB UUIDs)
  const idMap: Record<string, string> = {};
  insertedSteps.forEach((step: any) => {
    const originalNodeId = step.config?._canvas_node_id;
    if (originalNodeId) {
      idMap[originalNodeId] = step.id;
    }
  });

  // 4. Sync Edges
  const dbEdges = edges.map(edge => ({
    workflow_id: workflowId,
    source_step_id: idMap[edge.source],
    target_step_id: idMap[edge.target],
    source_handle: edge.sourceHandle || 'default',
    target_handle: edge.targetHandle || 'default'
  })).filter(e => e.source_step_id && e.target_step_id); // Only valid connections

  if (dbEdges.length > 0) {
    const { error: edgeErr } = await supabase.from('workflow_edges').insert(dbEdges);
    if (edgeErr) throw edgeErr;
  }

  return { success: true };
}

export async function deleteWorkflow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/automations');
  return { success: true };
}

// --- AI Insights ---
export async function calculateLeadScore(contactId: string) {
  const supabase = await createClient();
  
  // Simulation: Analysing contact activity with AI
  // In a real app, you'd fetch activities, notes, and conversations
  // then send them to an LLM like Gemini.
  
  const score = Math.floor(Math.random() * 100);
  const explanation = "Based on high frequency of clicks and 2 positive conversation messages today.";

  const { error } = await supabase
    .from('contacts')
    .update({ 
      lead_score: score,
      lead_score_explanation: explanation
    })
    .eq('id', contactId);

  if (error) throw error;
  return { score, explanation };
}

export async function getSmartReplySuggestions(conversationId: string) {
  // Mock AI suggestions
  return [
    "Sure, I can help you with that! When would you like to schedule a call?",
    "Thanks for reaching out! Our pricing plans start at $49/mo.",
    "I'll check with our team and get back to you shortly."
  ];
}
// --- Stats & Metrics ---
export async function getAutomationStats(workspaceId: string) {
  const supabase = await createClient();
  
  // 1. Get running/paused executions (Current Queue)
  const { count: runningCount } = await supabase
    .from('workflow_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'running');

  // 2. Get total executions in last 24h
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  
  const { count: totalRecent } = await supabase
    .from('workflow_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', yesterday.toISOString());

  // 3. Get failure count in last 24h
  const { count: failureCount } = await supabase
    .from('workflow_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'failed')
    .gte('created_at', yesterday.toISOString());

  // 4. Get active workflows count (New Table)
  const { count: workflowCount } = await supabase
    .from('workflows')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('is_active', true);

  return {
    pausedCount: runningCount || 0,
    totalRecent: totalRecent || 0,
    failureCount: failureCount || 0,
    workflowCount: workflowCount || 0,
    successRate: totalRecent ? Math.round(((totalRecent - (failureCount || 0)) / totalRecent) * 100) : 100
  };
}

export async function getAutomationLogsForContact(contactId: string) {
  const supabase = await createClient();
  
  // Correctly fetch logs by joining via workflow_executions
  const { data, error } = await supabase
    .from('workflow_step_logs')
    .select(`
      *,
      execution:workflow_executions!inner(
        id,
        contact_id,
        workflow:workflows(name)
      ),
      step:workflow_steps(type)
    `)
    .eq('execution.contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[automation-logs] Error:', error);
    return [];
  }
  return data || [];
}
