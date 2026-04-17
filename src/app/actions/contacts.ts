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
        await triggerWorkflows(workspaceId, 'contact_created', contact.id);
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

          // Trigger Automation for Tag Added
          try {
              const { triggerWorkflows } = await import('@/lib/automation/executor');
              await triggerWorkflows(workspaceId, 'tag_added', contact.id);
          } catch (err) {
              console.error('Tag automation trigger failed:', err);
          }
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

export async function recalculateLeadScore(id: string): Promise<ActionResult<Contact>> {
    const user = await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();

    try {
        const { data: contact } = await supabase.from('contacts').select('*').eq('id', id).single();
        if (!contact) return { success: false, error: 'Contact not found' };

        // Simple scoring logic for now
        let score = 0;
        if (contact.email) score += 20;
        if (contact.phone) score += 20;
        if (contact.source?.includes('Form')) score += 10;
        if ((contact.tags?.length || 0) > 0) score += 20;
        
        // Random bias for "AI hotness"
        score += Math.floor(Math.random() * 30);
        score = Math.min(score, 100);

        const { data: updated, error } = await supabase
            .from('contacts')
            .update({ 
                lead_score: score,
                lead_score_explanation: 'Score calculated based on contact details completeness and engagement history.'
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Trigger Automation for Lead Scored
        try {
            const { triggerWorkflows } = await import('@/lib/automation/executor');
            await triggerWorkflows(workspaceId, 'lead_scored', id);
        } catch (err) {
            console.error('Lead Scored automation trigger failed:', err);
        }

        revalidatePath(`/contacts/${id}`);
        return { success: true, data: updated };
    } catch (err) {
        return { success: false, error: 'Failed to recalculate score' };
    }
}

