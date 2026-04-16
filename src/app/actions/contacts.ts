'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult, Contact } from '@/types/crm.types';

export async function createContact(payload: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: string;
  ownerId?: string;
  tags?: string[];
}): Promise<ActionResult<Contact>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) {
    return { success: false, error: 'No active workspace found' };
  }

  const supabase = await createServerClient();

  try {
    // Check for duplicates first if email is provided
    if (payload.email) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('email', payload.email)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'A contact with this email already exists in your workspace.' };
      }
    }

    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
          workspace_id: workspaceId,
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          source: payload.source,
          owner_id: payload.ownerId,
          tags: payload.tags || [],
      })
      .select()
      .single();

    if (error) {
        console.error('Error creating contact:', error);
        return { success: false, error: 'Failed to create contact' };
    }

    // 1. Log Activity
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        type: 'system',
        description: `Contact created by ${user.email}`,
        created_by: user.id
    });

    // 2. Trigger Automations
    try {
        const { triggerWorkflows } = await import('@/lib/automation/executor');
        await triggerWorkflows(workspaceId, 'Contact Created', contact.id);
    } catch (err) {
        console.error('Automation trigger failed:', err);
        // We don't fail the contact creation if automation fails
    }

    revalidatePath('/contacts');
    return { success: true, data: contact };
  } catch (err) {
    console.error('Create contact exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateContact(id: string, payload: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  ownerId: string;
  tags: string[];
}>): Promise<ActionResult<Contact>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) {
    return { success: false, error: 'No active workspace found' };
  }

  const supabase = await createServerClient();

  try {
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          source: payload.source,
          owner_id: payload.ownerId,
          tags: payload.tags,
      })
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) {
        console.error('Error updating contact:', error);
        return { success: false, error: 'Failed to update contact' };
    }

    // Log activity
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: contact.id,
        type: 'system',
        description: `Contact details updated`,
        created_by: user.id
    });

    revalidatePath('/contacts');
    revalidatePath(`/contacts/${id}`);
    return { success: true, data: contact };
  } catch (err) {
    console.error('Update contact exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteContact(id: string): Promise<ActionResult> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();

  if (!workspaceId) {
    return { success: false, error: 'No active workspace found' };
  }

  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) {
        console.error('Error deleting contact:', error);
        return { success: false, error: 'Failed to delete contact' };
    }

    revalidatePath('/contacts');
    return { success: true };
  } catch (err) {
    console.error('Delete contact exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function bulkAddTags(ids: string[], tags: string[]): Promise<ActionResult> {
    const user = await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
  
    if (!workspaceId) {
      return { success: false, error: 'No active workspace found' };
    }
  
    const supabase = await createServerClient();
  
    try {
      // Fetch current tags for all selected contacts
      const { data: contacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, tags')
        .in('id', ids)
        .eq('workspace_id', workspaceId);
  
      if (fetchError || !contacts) {
          return { success: false, error: 'Failed to fetch contacts for tag update' };
      }
  
      // Update each contact by merging tags
      for (const contact of contacts) {
          const newTags = Array.from(new Set([...(contact.tags || []), ...tags]));
          await supabase.from('contacts').update({ tags: newTags }).eq('id', contact.id);
          
          await supabase.from('contact_activities').insert({
            workspace_id: workspaceId,
            contact_id: contact.id,
            type: 'system',
            description: `Tags added: ${tags.join(', ')}`,
            created_by: user.id
          });
      }
  
      revalidatePath('/contacts');
      return { success: true };
    } catch (err) {
      console.error('Bulk tag exception:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function bulkAssignOwner(ids: string[], ownerId: string): Promise<ActionResult> {
    const user = await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
  
    if (!workspaceId) {
      return { success: false, error: 'No active workspace found' };
    }
  
    const supabase = await createServerClient();
  
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ owner_id: ownerId })
        .in('id', ids)
        .eq('workspace_id', workspaceId);
  
      if (error) {
          return { success: false, error: 'Failed to bulk assign owner' };
      }

      // Log activity for each (could be optimized with a batch insert)
      const activities = ids.map(id => ({
        workspace_id: workspaceId,
        contact_id: id,
        type: 'system',
        description: `Owner assigned via bulk action`,
        created_by: user.id
      }));

      await supabase.from('contact_activities').insert(activities);
  
      revalidatePath('/contacts');
      return { success: true };
    } catch (err) {
      console.error('Bulk assign exception:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getContact(id: string): Promise<ActionResult<Contact>> {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
  
    if (!workspaceId) {
      return { success: false, error: 'No active workspace found' };
    }
  
    const supabase = await createServerClient();
  
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('workspace_id', workspaceId)
        .single();
  
      if (error || !data) {
          return { success: false, error: 'Contact not found' };
      }
  
      return { success: true, data };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
}

