'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult, Opportunity, Pipeline, PipelineStage } from '@/types/crm.types';

// --- PIPELINES & STAGES ---

export async function getPipelines(): Promise<ActionResult<Pipeline[]>> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: 'Failed to fetch pipelines' };
    
    // If no pipelines, create a default one
    if (data.length === 0) {
        const { data: newPipeline, error: createError } = await ensureDefaultPipeline(workspaceId);
        if (createError) return { success: false, error: 'Failed to create default pipeline' };
        return { success: true, data: [newPipeline] };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

async function ensureDefaultPipeline(workspaceId: string) {
    const supabase = await createServerClient();
    
    const { data: pipeline, error: pError } = await supabase
        .from('pipelines')
        .insert({
            workspace_id: workspaceId,
            name: 'Sales Pipeline',
            is_default: true
        })
        .select()
        .single();

    if (pError) return { data: null, error: pError };

    const stages = [
        { name: 'Lead', position: 0 },
        { name: 'Contacted', position: 1 },
        { name: 'Proposal', position: 2 },
        { name: 'Closing', position: 3 }
    ].map(s => ({ ...s, workspace_id: workspaceId, pipeline_id: pipeline.id }));

    const { error: sError } = await supabase.from('pipeline_stages').insert(stages);
    if (sError) return { data: null, error: sError };

    return { data: pipeline, error: null };
}


export async function getPipelineStages(pipelineId: string): Promise<ActionResult<PipelineStage[]>> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .eq('workspace_id', workspaceId)
      .order('position', { ascending: true });

    if (error) return { success: false, error: 'Failed to fetch stages' };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function getPipelineOpportunities(pipelineId: string): Promise<ActionResult<Opportunity[]>> {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };
  
    const supabase = await createServerClient();
  
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
            *,
            contact:contacts(first_name, last_name),
            stage:pipeline_stages!inner(pipeline_id)
        `)
        .eq('stage.pipeline_id', pipelineId)
        .eq('workspace_id', workspaceId)
        .order('position', { ascending: true });
  
      if (error) return { success: false, error: 'Failed' };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: 'Error' };
    }
}



// --- OPPORTUNITIES (DEALS) ---

export async function createDeal(payload: {
  title: string;
  stageId: string;
  contactId?: string;
  value?: number;
  ownerId?: string;
}): Promise<ActionResult<Opportunity>> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    // Get max position in stage
    const { data: maxPosData } = await supabase
      .from('opportunities')
      .select('position')
      .eq('stage_id', payload.stageId)
      .order('position', { ascending: false })
      .limit(1);

    const position = (maxPosData?.[0]?.position ?? -1) + 1;

    const { data: deal, error } = await supabase
      .from('opportunities')
      .insert({
          workspace_id: workspaceId,
          title: payload.title,
          stage_id: payload.stageId,
          contact_id: payload.contactId,
          value: payload.value || 0,
          owner_id: payload.ownerId,
          position,
          status: 'open'
      })
      .select()
      .single();

    if (error) return { success: false, error: 'Failed to create deal' };

    // Log Activity for contact if linked
    if (payload.contactId) {
        await supabase.from('contact_activities').insert({
            workspace_id: workspaceId,
            contact_id: payload.contactId,
            type: 'deal',
            description: `New deal created: ${payload.title}`,
            created_by: user.id
        });
    }

    revalidatePath('/pipelines');
    return { success: true, data: deal };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function updateDealStage(
  dealId: string, 
  stageId: string, 
  position: number,
  contactId?: string
): Promise<ActionResult> {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  try {
    const { data: deal, error } = await supabase
      .from('opportunities')
      .update({ 
          stage_id: stageId, 
          position: position,
          stage_entered_at: stageId !== stageId ? new Date().toISOString() : undefined // Position update vs Stage update logic
      })
      .eq('id', dealId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) return { success: false, error: 'Failed to move deal' };

    // Log Activity if contact is linked
    if (deal.contact_id) {
        await supabase.from('contact_activities').insert({
            workspace_id: workspaceId,
            contact_id: deal.contact_id,
            type: 'deal',
            description: `Deal moved to new stage`,
            created_by: user.id
        });
    }

    revalidatePath('/pipelines');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Server error' };
  }
}

export async function updateDeal(id: string, payload: Partial<{
    title: string;
    value: number;
    status: 'open' | 'won' | 'lost';
    ownerId: string;
}>): Promise<ActionResult<Opportunity>> {
    const user = await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();

    try {
        const { data: deal, error } = await supabase
            .from('opportunities')
            .update({
                title: payload.title,
                value: payload.value,
                status: payload.status,
                owner_id: payload.ownerId
            })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) return { success: false, error: 'Failed to update deal' };

        if (deal.contact_id && payload.status) {
            await supabase.from('contact_activities').insert({
                workspace_id: workspaceId,
                contact_id: deal.contact_id,
                type: 'deal',
                description: `Deal status marked as ${payload.status}`,
                created_by: user.id
            });
        }

        revalidatePath('/pipelines');
        return { success: true, data: deal };
    } catch (err) {
        return { success: false, error: 'Server error' };
    }
}
