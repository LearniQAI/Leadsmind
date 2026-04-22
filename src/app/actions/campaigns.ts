'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId, requireAdmin } from '@/lib/auth';
import { EmailCampaign, CampaignStatus, EmailTemplate } from '@/types/campaigns.types';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

// Helper to get Resend instance for a workspace
async function getResendClient(workspaceId: string) {
  const supabase = await createServerClient();
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('resend_api_key')
    .eq('id', workspaceId)
    .single();

  const apiKey = workspace?.resend_api_key || process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend API Key not configured');
  return new Resend(apiKey);
}

export async function fetchCampaigns() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('email_campaigns')
    .select('*, campaign_stats(*)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function createCampaign(values: Partial<EmailCampaign>) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No active workspace');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      ...values,
      workspace_id: workspaceId,
      status: 'draft',
      recipient_count: 0
    })
    .select()
    .single();

  if (error) throw error;

  // Initialize stats row
  await supabase.from('campaign_stats').insert({
    campaign_id: data.id,
    workspace_id: workspaceId
  });

  revalidatePath('/campaigns');
  return data;
}

export async function updateCampaign(id: string, updates: Partial<EmailCampaign>) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No active workspace');

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', id)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  revalidatePath('/campaigns');
  return { success: true };
}

export async function deleteCampaign(id: string) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  revalidatePath('/campaigns');
  return { success: true };
}

// Templates Actions
export async function fetchTemplates() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function saveTemplate(values: Partial<EmailTemplate>) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('email_templates')
    .upsert({
      ...values,
      workspace_id: workspaceId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/templates/email');
  return data;
}

// Sending Logic
export async function sendTestEmail(campaignId: string, email: string) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No workspace');

  const supabase = await createServerClient();
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (!campaign) throw new Error('Campaign not found');

  const resend = await getResendClient(workspaceId);
  const { error } = await resend.emails.send({
    from: campaign.from_email || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: `[TEST] ${campaign.subject}`,
    html: campaign.body_html || 'Empty content'
  });

  if (error) throw error;
  return { success: true };
}
