'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { ActionResult } from '@/types/crm.types';
import { revalidatePath } from 'next/cache';

export async function createCustomObject(payload: {
    nameSingular: string;
    namePlural: string;
    description?: string;
    icon?: string;
}): Promise<ActionResult<any>> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
        .from('custom_objects')
        .insert({
            workspace_id: workspaceId,
            name_singular: payload.nameSingular,
            name_plural: payload.namePlural,
            description: payload.description,
            icon: payload.icon
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/settings/objects');
    return { success: true, data };
}

export async function addCustomField(payload: {
    objectId: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'dropdown' | 'currency' | 'lookup';
    lookupTarget?: string;
    isRequired?: boolean;
}): Promise<ActionResult> {
    const supabase = await createServerClient();
    
    const { error } = await supabase
        .from('custom_object_fields')
        .insert({
            object_id: payload.objectId,
            name: payload.name,
            label: payload.label,
            type: payload.type,
            lookup_target: payload.lookupTarget,
            is_required: payload.isRequired || false
        });

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/settings/objects');
    return { success: true };
}

export async function createObjectRecord(objectId: string, data: any): Promise<ActionResult> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    const { error } = await supabase
        .from('custom_object_records')
        .insert({
            object_id: objectId,
            workspace_id: workspaceId,
            data
        });

    if (error) return { success: false, error: error.message };
    
    return { success: true };
}

export async function getCustomObjects(): Promise<ActionResult<any[]>> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
        .from('custom_objects')
        .select(`
            *,
            fields:custom_object_fields(*)
        `)
        .eq('workspace_id', workspaceId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
}
