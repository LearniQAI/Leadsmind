'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Bulk add a tag to multiple contacts
 */
export async function bulkAddTag(contactIds: string[], tagName: string) {
  const supabase = await createClient();
  const tag = tagName.trim();
  
  if (!tag) return { success: false, error: "Tag cannot be empty" };

  try {
    // We use a RPC or multiple updates. For simplicity and reliability in Supabase, 
    // we fetch current tags and append.
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, tags')
      .in('id', contactIds);

    if (!contacts) return { success: false, error: "No contacts found" };

    const updates = contacts.map(c => {
      const currentTags = c.tags || [];
      if (currentTags.includes(tag)) return null;
      return supabase
        .from('contacts')
        .update({ tags: [...currentTags, tag] })
        .eq('id', c.id);
    }).filter(Boolean);

    await Promise.all(updates as any);

    // Trigger Automations for each contact
    const { triggerWorkflows } = await import('@/lib/automation/executor');
    const { getCurrentWorkspaceId } = await import('@/lib/auth');
    const workspaceId = await getCurrentWorkspaceId();
    
    if (workspaceId) {
      await Promise.all(contactIds.map(id => 
        triggerWorkflows(workspaceId, 'tag_added', id)
      ));
    }
    
    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Bulk remove a tag from multiple contacts
 */
export async function bulkRemoveTag(contactIds: string[], tagName: string) {
  const supabase = await createClient();
  
  try {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, tags')
      .in('id', contactIds);

    if (!contacts) return { success: false, error: "No contacts found" };

    const updates = contacts.map(c => {
      const currentTags = c.tags || [];
      if (!currentTags.includes(tagName)) return null;
      return supabase
        .from('contacts')
        .update({ tags: currentTags.filter((t: string) => t !== tagName) })
        .eq('id', c.id);
    }).filter(Boolean);

    await Promise.all(updates as any);
    
    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all unique tags and their counts for a workspace
 */
export async function getWorkspaceTags(workspaceId: string) {
  const supabase = await createClient();

  // Supabase doesn't have an easy way to count unique array elements across rows in one query
  // so we fetch the tags and process in the action.
  const { data: contacts } = await supabase
    .from('contacts')
    .select('tags')
    .eq('workspace_id', workspaceId);

  const tagCounts: Record<string, number> = {};
  contacts?.forEach(c => {
    c.tags?.forEach((t: string) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count,
    id: name, // Using name as ID for simplicity
  })).sort((a, b) => b.count - a.count);
}
