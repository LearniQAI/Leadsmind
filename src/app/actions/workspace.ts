'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId, getUser, getCurrentWorkspace, requireAdmin } from '@/lib/auth';
import { WorkspaceValues } from '@/lib/validations/workspace.schema';
import { AutomationSettingsValues } from '@/lib/validations/automation-settings.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

export async function getWorkspaceMembers() {
  let workspaceId = await getCurrentWorkspaceId();
  
  if (!workspaceId) {
    const workspace = await getCurrentWorkspace();
    workspaceId = workspace?.id ?? null;
  }

  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      users (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('workspace_id', workspaceId);

  if (error || !data) return [];

  return (data as any[]).map((m) => {
    // PostgREST might return the joined user as an object or a single-item array
    const user = Array.isArray(m.users) ? m.users[0] : m.users;
    
    if (!user) {
      return {
        id: m.user_id,
        name: 'Unknown User',
        email: 'N/A',
      };
    }

    return {
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown',
      email: user.email,
    };
  });
}

export async function updateWorkspace(workspaceId: string, values: WorkspaceValues) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('workspaces')
    .update({
      name: values.name,
      slug: values.slug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings/workspace');
  return { success: true };
}

export async function uploadLogo(workspaceId: string, formData: FormData) {
  const supabase = await createServerClient();
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const file = formData.get('logo') as File | null;
  if (!file) return { success: false, error: 'No file provided' };

  const fileExt = file.name.split('.').pop();
  const filePath = `${workspaceId}/logo.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('workspace-logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from('workspace-logos')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('workspaces')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', workspaceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/settings/workspace');
  return { success: true };
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createServerClient();
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Verify user is admin of this workspace
  const { data: membership, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !membership || membership.role !== 'admin') {
    return { success: false, error: 'Only workspace admins can delete a workspace' };
  }

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function switchWorkspace(workspaceId: string) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createServerClient();

  // Verify the user is a member of the target workspace
  const { data: membership, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !membership) {
    return { success: false, error: 'You are not a member of this workspace' };
  }

  const cookieStore = await cookies();
  cookieStore.set('active_workspace_id', workspaceId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function createNewWorkspace(name: string) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' } as const;

  const supabase = await createServerClient();

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: workspace, error: createError } = await supabase
    .from('workspaces')
    .insert({ name, slug, owner_id: user.id, plan: 'free' })
    .select()
    .single();

  if (createError || !workspace) {
    return { success: false, error: createError?.message ?? 'Failed to create workspace' } as const;
  }

  // Add creator as admin
  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'admin',
  });

  if (memberError) {
    return { success: false, error: memberError.message } as const;
  }

  const cookieStore = await cookies();
  cookieStore.set('active_workspace_id', workspace.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath('/settings/account');
  return { success: true, workspace } as const;
}

export async function updateAutomationSettings(values: AutomationSettingsValues) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  const { error } = await supabase
    .from('workspaces')
    .update({
      resend_api_key: values.resend_api_key,
      email_from_name: values.email_from_name,
      email_from_address: values.email_from_address,
      twilio_sid: values.twilio_sid,
      twilio_token: values.twilio_token,
      twilio_number: values.twilio_number,
      webhook_secret: values.webhook_secret,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings/automation');
  return { success: true };
}

export async function testResendConnection(apiKey: string) {
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.apiKeys.list();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to verify Resend API key' };
  }
}

export async function testTwilioConnection(sid: string, token: string) {
  try {
    const client = new Twilio(sid, token);
    await client.api.v2010.accounts(sid).fetch();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to verify Twilio credentials' };
  }
}
