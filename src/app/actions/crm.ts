'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult, ContactNote, ContactTask, ContactActivity } from '@/types/crm.types';

// --- NOTES ---

export async function createNote(payload: {
  contactId: string;
  content: string;
}): Promise<ActionResult<ContactNote>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { data: note, error } = await supabase
      .from('contact_notes')
      .insert({
          workspace_id: workspaceId,
          contact_id: payload.contactId,
          content: payload.content,
          created_by: user.id
      })
      .select()
      .single();

    if (error) return { success: false, error: 'Failed to create note' };

    // Log Activity
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: payload.contactId,
        type: 'note',
        description: `Added a note`,
        created_by: user.id
    });

    revalidatePath(`/contacts/${payload.contactId}`);
    return { success: true, data: note };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function deleteNote(id: string, contactId: string): Promise<ActionResult> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from('contact_notes')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) return { success: false, error: 'Failed to delete note' };

    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

// --- TASKS ---

export async function createTask(payload: {
  contactId: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
}): Promise<ActionResult<ContactTask>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { data: task, error } = await supabase
      .from('contact_tasks')
      .insert({
          workspace_id: workspaceId,
          contact_id: payload.contactId,
          title: payload.title,
          description: payload.description,
          due_date: payload.dueDate,
          assigned_to: payload.assignedTo,
          created_by: user.id,
          status: 'todo'
      })
      .select()
      .single();

    if (error) return { success: false, error: 'Failed to create task' };

    // Log Activity
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: payload.contactId,
        type: 'task',
        description: `Created task: ${payload.title}`,
        created_by: user.id
    });

    revalidatePath(`/contacts/${payload.contactId}`);
    return { success: true, data: task };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function toggleTaskStatus(id: string, contactId: string, currentStatus: 'todo' | 'completed'): Promise<ActionResult> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();
  const newStatus = currentStatus === 'todo' ? 'completed' : 'todo';

  try {
    const { error } = await supabase
      .from('contact_tasks')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) return { success: false, error: 'Failed to update task' };

    // Log Activity
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: contactId,
        type: 'task',
        description: `Task marked as ${newStatus}`,
        created_by: user.id
    });

    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function deleteTask(id: string, contactId: string): Promise<ActionResult> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from('contact_tasks')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) return { success: false, error: 'Failed to delete task' };

    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function handleDeleteTask(id: string, contactId: string): Promise<ActionResult> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };
  const supabase = await createServerClient();
  try {
    const { error } = await supabase.from('contact_tasks').delete().eq('id', id).eq('workspace_id', workspaceId);
    if (error) return { success: false, error: 'Failed' };
    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) { return { success: false, error: 'Error' }; }
}

export async function getContactActivities(contactId: string): Promise<ActionResult<ContactActivity[]>> {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };
    const supabase = await createServerClient();
    try {
        const { data, error } = await supabase
            .from('contact_activities')
            .select('*')
            .eq('contact_id', contactId)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });
        if (error) return { success: false, error: 'Failed to fetch' };
        return { success: true, data };
    } catch (err) { return { success: false, error: 'Error' }; }
}

export async function getContactNotes(contactId: string): Promise<ActionResult<ContactNote[]>> {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };
    const supabase = await createServerClient();
    try {
        const { data, error } = await supabase
            .from('contact_notes')
            .select('*')
            .eq('contact_id', contactId)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });
        if (error) return { success: false, error: 'Failed to fetch' };
        return { success: true, data };
    } catch (err) { return { success: false, error: 'Error' }; }
}

export async function getContactTasks(contactId: string): Promise<ActionResult<ContactTask[]>> {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };
    const supabase = await createServerClient();
    try {
        const { data, error } = await supabase
            .from('contact_tasks')
            .select('*')
            .eq('contact_id', contactId)
            .eq('workspace_id', workspaceId)
            .order('status', { ascending: false }) // todo first
            .order('created_at', { ascending: false });
        if (error) return { success: false, error: 'Failed to fetch' };
        return { success: true, data };
    } catch (err) { return { success: false, error: 'Error' }; }
}
