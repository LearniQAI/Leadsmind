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
      nodes: [],
      edges: []
    })
    .select()
    .single();

  if (error) throw error;
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
