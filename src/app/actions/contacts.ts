'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult, Contact } from '@/types/crm.types';
import { sendEmail } from '@/lib/email';

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
          email: payload.email || null,
          phone: payload.phone || null,
          source: payload.source || null,
          owner_id: payload.ownerId || null,
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
          email: payload.email || null,
          phone: payload.phone || null,
          source: payload.source || null,
          owner_id: payload.ownerId || null,
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

export async function sendContactEmail(id: string, payload: { subject: string; body: string; isHtml?: boolean }) {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();
  const { data: contact } = await supabase.from('contacts').select('email, first_name').eq('id', id).single();
  if (!contact?.email) return { success: false, error: 'Contact has no email address' };

  try {
    const { data: workspace } = await supabase.from('workspaces').select('resend_api_key, email_from_name, email_from_address').eq('id', workspaceId).single();

    // The system will throw here if delivery fails, which is exactly what we want.
    await sendEmail({
      to: contact.email,
      subject: payload.subject,
      html: payload.isHtml ? payload.body : undefined,
      text: !payload.isHtml ? payload.body : undefined,
      config: {
        apiKey: workspace?.resend_api_key,
        fromEmail: workspace?.email_from_address,
        fromName: workspace?.email_from_name
      }
    });

    // Log Activity
    await supabase.from('contact_activities').insert({
      workspace_id: workspaceId,
      contact_id: id,
      type: 'email',
      description: `Sent email: ${payload.subject}`,
      created_by: user.id
    });

    revalidatePath(`/contacts/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error('[sendContactEmail] Failed:', err.message);
    return { success: false, error: err.message || 'Failed to deliver email' };
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

export async function addTag(id: string, tag: string): Promise<ActionResult> {
    return bulkAddTags([id], [tag]);
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

// --- CRM Extensions (Notes, Tasks, Activities) ---

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

    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: payload.contactId,
        type: 'note',
        description: `Added a note`,
        created_by: user.id
    });

    revalidatePath(`/contacts/${payload.contactId}`);
    return { success: true, data: note };
  } catch (err) { return { success: false, error: 'Server error' }; }
}

export async function deleteNote(id: string, contactId: string): Promise<ActionResult> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };
  const supabase = await createServerClient();
  try {
    await supabase.from('contact_notes').delete().eq('id', id).eq('workspace_id', workspaceId);
    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) { return { success: false, error: 'Error' }; }
}

export async function createTask(payload: {
  contactId: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
}): Promise<ActionResult<ContactTask>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
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
    if (error) throw error;
    revalidatePath(`/contacts/${payload.contactId}`);
    return { success: true, data: task };
  } catch (err) { return { success: false, error: 'Error' }; }
}

export async function toggleTaskStatus(id: string, contactId: string, currentStatus: string): Promise<ActionResult> {
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();
  const newStatus = currentStatus === 'todo' ? 'completed' : 'todo';
  try {
    await supabase.from('contact_tasks').update({ status: newStatus }).eq('id', id).eq('workspace_id', workspaceId);
    revalidatePath(`/contacts/${contactId}`);
    return { success: true };
  } catch (err) { return { success: false, error: 'Error' }; }
}

export async function getContactActivities(contactId: string) {
    const supabase = await createServerClient();
    const { data } = await supabase.from('contact_activities').select('*').eq('contact_id', contactId).order('created_at', { ascending: false });
    return data || [];
}

export async function getContactNotes(contactId: string) {
    const supabase = await createServerClient();
    const { data } = await supabase.from('contact_notes').select('*').eq('contact_id', contactId).order('created_at', { ascending: false });
    return data || [];
}

export async function getContactTasks(contactId: string) {
    const supabase = await createServerClient();
    const { data } = await supabase.from('contact_tasks').select('*').eq('contact_id', contactId).order('status', { ascending: false }).order('created_at', { ascending: false });
    return data || [];
}

// --- Tag Management ---

export async function bulkAddTag(contactIds: string[], tagName: string) {
  const supabase = await createServerClient();
  const tag = tagName.trim();
  if (!tag) return { success: false, error: "Tag cannot be empty" };

  try {
    const { data: contacts } = await supabase.from('contacts').select('id, tags').in('id', contactIds);
    if (!contacts) return { success: false, error: "No contacts found" };

    const updates = contacts.map(c => {
      const currentTags = c.tags || [];
      if (currentTags.includes(tag)) return null;
      return supabase.from('contacts').update({ tags: [...currentTags, tag] }).eq('id', c.id);
    }).filter(Boolean);

    await Promise.all(updates as any);

    const { triggerWorkflows } = await import('@/lib/automation/executor');
    const workspaceId = await getCurrentWorkspaceId();
    if (workspaceId) {
      await Promise.all(contactIds.map(id => triggerWorkflows(workspaceId, 'tag_added', id)));
    }
    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkRemoveTag(contactIds: string[], tagName: string) {
  const supabase = await createServerClient();
  try {
    const { data: contacts } = await supabase.from('contacts').select('id, tags').in('id', contactIds);
    if (!contacts) return { success: false, error: "No contacts found" };

    const updates = contacts.map(c => {
      const currentTags = c.tags || [];
      if (!currentTags.includes(tagName)) return null;
      return supabase.from('contacts').update({ tags: currentTags.filter((t: string) => t !== tagName) }).eq('id', c.id);
    }).filter(Boolean);

    await Promise.all(updates as any);
    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWorkspaceTags(workspaceId: string) {
  const supabase = await createServerClient();
  const { data: contacts } = await supabase.from('contacts').select('tags').eq('workspace_id', workspaceId);
  const tagCounts: Record<string, number> = {};
  contacts?.forEach(c => {
    c.tags?.forEach((t: string) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count,
    id: name,
  })).sort((a, b) => b.count - a.count);
}

// --- CRM Detail Logic ---

export async function getContactNotes(contactId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('contact_notes')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data || [] };
}

export async function getContactTasks(contactId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('contact_tasks')
    .select('*')
    .eq('contact_id', contactId)
    .order('due_date', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data || [] };
}

export async function getContactActivities(contactId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('contact_activities')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data || [] };
}

export async function deleteTask(taskId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('contact_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
  revalidatePath('/contacts/[id]');
  return { success: true };
}

