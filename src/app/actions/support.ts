'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function getTickets() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      contact:contacts(first_name, last_name, email),
      assigned_to_user:auth.users!assigned_to(email)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
     console.error('Error fetching tickets:', error);
     return [];
  }
  return data;
}

export async function getTicketStats() {
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('status, priority')
    .eq('workspace_id', workspaceId);

  if (!tickets) return { open: 0, high: 0, total: 0 };

  return tickets.reduce((acc, t) => {
    acc.total += 1;
    if (t.status === 'open') acc.open += 1;
    if (t.priority === 'high' || t.priority === 'urgent') acc.high += 1;
    return acc;
  }, { open: 0, high: 0, total: 0 });
}

export async function createTicket(values: any) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No workspace');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...values,
      workspace_id: workspaceId,
      status: 'open'
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/support');
  return data;
}
