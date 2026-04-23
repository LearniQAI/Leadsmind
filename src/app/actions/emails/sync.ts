'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/types/crm.types';

export async function getConnectedEmailAccounts(): Promise<ActionResult<any[]>> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No workspace' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data || [] };
}

export async function disconnectEmailAccount(accountId: string): Promise<ActionResult> {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('email_accounts')
    .delete()
    .eq('id', accountId)
    .eq('workspace_id', workspaceId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/settings/emails');
  return { success: true };
}

export async function getOAuthUrl(provider: 'gmail' | 'outlook'): Promise<string> {
  const workspaceId = await getCurrentWorkspaceId();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/integrations/oauth/callback/${provider}`;
  
  if (provider === 'gmail') {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${workspaceId}`;
  } else {
    const scopes = [
      'offline_access',
      'user.read',
      'mail.read',
      'mail.send',
      'mail.readwrite'
    ].join(' ');

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&response_mode=query&state=${workspaceId}`;
  }
}
