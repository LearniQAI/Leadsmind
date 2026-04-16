'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Workflows ---
export async function getWorkflows(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createWorkflow(workspaceId: string, name: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('automation_workflows')
    .insert({
      workspace_id: workspaceId,
      name,
      trigger_type: 'manual',
      trigger_config: {},
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: { label: 'Manual Trigger', type: 'manual' }
        }
      ],
      edges: [],
      status: 'draft'
    })
    .select('*')
    .single();

  if (error) {
    console.error("Workflow creation failed:", error);
    throw new Error(`Execution failed: ${error.message}`);
  }
  
  revalidatePath('/automations');
  return data;
}

export async function updateWorkflow(id: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('automation_workflows')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkflow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('automation_workflows')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
  
  // 1. Get paused executions (Current Queue)
  const { count: pausedCount } = await supabase
    .from('automation_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'paused');

  // 2. Get total executions in last 24h
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  
  const { count: totalRecent } = await supabase
    .from('automation_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', yesterday.toISOString());

  // 3. Get failure count in last 24h
  const { count: failureCount } = await supabase
    .from('automation_executions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'failed')
    .gte('created_at', yesterday.toISOString());

  // 4. Get active workflows count
  const { count: workflowCount } = await supabase
    .from('automation_workflows')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  return {
    pausedCount: pausedCount || 0,
    totalRecent: totalRecent || 0,
    failureCount: failureCount || 0,
    workflowCount: workflowCount || 0,
    successRate: totalRecent ? Math.round(((totalRecent - (failureCount || 0)) / totalRecent) * 100) : 100
  };
}
