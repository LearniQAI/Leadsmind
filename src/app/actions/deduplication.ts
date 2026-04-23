'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { ActionResult } from '@/types/crm.types';
import { revalidatePath } from 'next/cache';

export async function startDuplicateScan(criteria: 'email' | 'phone' | 'name' = 'email'): Promise<ActionResult<string>> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No workspace' };

  const supabase = await createServerClient();
  
  // 1. Create a scan record
  const { data: scan, error: scanError } = await supabase
    .from('duplicate_scans')
    .insert({
        workspace_id: workspaceId,
        status: 'running'
    })
    .select()
    .single();

  if (scanError) return { success: false, error: scanError.message };

  // 2. Perform the scan (simulated in background or synchronously for small sets)
  try {
    const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, phone')
        .eq('workspace_id', workspaceId);

    if (!contacts) throw new Error('No contacts found');

    const groups: Record<string, string[]> = {};
    contacts.forEach(c => {
        const val = criteria === 'email' ? c.email?.toLowerCase() : (criteria === 'phone' ? c.phone : `${c.first_name} ${c.last_name}`.toLowerCase());
        if (val) {
            if (!groups[val]) groups[val] = [];
            groups[val].push(c.id);
        }
    });

    const duplicateGroups = Object.entries(groups).filter(([_, ids]) => ids.length > 1);

    for (const [key, ids] of duplicateGroups) {
        await supabase.from('duplicate_groups').insert({
            scan_id: scan.id,
            workspace_id: workspaceId,
            contact_ids: ids,
            match_criteria: criteria
        });
    }

    // 3. Complete the scan
    await supabase.from('duplicate_scans').update({
        status: 'completed',
        total_records: contacts.length,
        duplicates_found: duplicateGroups.length
    }).eq('id', scan.id);

    revalidatePath('/contacts/duplicates');
    return { success: true, data: scan.id };

  } catch (err: any) {
    await supabase.from('duplicate_scans').update({ status: 'failed' }).eq('id', scan.id);
    return { success: false, error: err.message };
  }
}

export async function getDuplicateGroups(): Promise<ActionResult<any[]>> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
        .from('duplicate_groups')
        .select(`
            *,
            contacts:contact_ids
        `)
        .eq('workspace_id', workspaceId)
        .eq('status', 'pending');

    if (error) return { success: false, error: error.message };

    // Fetch full contact details for each group
    const enhancedGroups = await Promise.all(data.map(async (group) => {
        const { data: contactDetails } = await supabase
            .from('contacts')
            .select('*')
            .in('id', group.contact_ids);
        
        return { ...group, contactDetails };
    }));

    return { success: true, data: enhancedGroups };
}

export async function mergeDuplicateGroup(groupId: string, primaryContactId: string): Promise<ActionResult> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    // 1. Get the group
    const { data: group } = await supabase.from('duplicate_groups').select('*').eq('id', groupId).single();
    if (!group) return { success: false, error: 'Group not found' };

    const duplicateIds = group.contact_ids.filter((id: string) => id !== primaryContactId);

    try {
        // 2. Reassign activities, notes, tasks, emails to primary contact
        const tables = ['contact_activities', 'contact_notes', 'tasks', 'contact_emails'];
        for (const table of tables) {
            await supabase
                .from(table)
                .update({ contact_id: primaryContactId })
                .in('contact_id', duplicateIds)
                .eq('workspace_id', workspaceId);
        }

        // 3. Delete duplicates
        await supabase.from('contacts').delete().in('id', duplicateIds).eq('workspace_id', workspaceId);

        // 4. Mark group as merged
        await supabase.from('duplicate_groups').update({ status: 'merged' }).eq('id', groupId);

        revalidatePath('/contacts');
        revalidatePath('/contacts/duplicates');
        return { success: true };

    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
