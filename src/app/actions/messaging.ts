'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin, getCurrentWorkspaceId } from '@/lib/auth';
import { 
  twilioSchema, TwilioValues,
  emailSchema, EmailValues,
  metaSchema, MetaValues,
  twitterSchema, TwitterValues
} from '@/lib/validations/messaging.schema';
import { revalidatePath } from 'next/cache';

/**
 * Connects a Twilio account to the current workspace.
 * Stores the Account SID, Auth Token, and Phone Number.
 */
export async function connectTwilio(values: TwilioValues) {
  try {
    // 1. Ensure user is admin
    await requireAdmin();
    
    // 2. Get active workspace ID
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return { success: false, error: 'No active workspace found. Please select a workspace first.' };
    }

    // 3. Validate inputs
    const validated = twilioSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createServerClient();
    
    // 4. Update or Insert connection
    // Note: platform is 'sms' for Twilio in our schema, though it could also be 'whatsapp'
    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', 'sms')
      .single();

    if (existing) {
      const { error } = await supabase
        .from('platform_connections')
        .update({
          credentials: values,
          status: 'connected',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('platform_connections')
        .insert({
          workspace_id: workspaceId,
          platform: 'sms',
          credentials: values,
          status: 'connected'
        });
        
      if (error) throw error;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('[messaging] Error connecting Twilio:', error);
    return { success: false, error: error.message || 'An unexpected error occurred while connecting Twilio' };
  }
}

/**
 * Disconnects a platform from the current workspace.
 */
export async function disconnectPlatform(platform: string) {
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('platform_connections')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('platform', platform);

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches connected platforms for the current workspace.
 */
export async function getConnectedPlatforms() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return [];

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('platform_connections')
      .select('platform, status, last_sync_at')
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[messaging] Error fetching platforms:', error);
    return [];
  }
}

async function baseConnect(platform: string, values: any, schema: any) {
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace found.' };

    const validated = schema.safeParse(values);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const supabase = await createServerClient();
    
    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('platform_connections')
        .update({ credentials: values, status: 'connected', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('platform_connections')
        .insert({ workspace_id: workspaceId, platform, credentials: values, status: 'connected' });
      if (error) throw error;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error(`[messaging] Error connecting ${platform}:`, error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function connectEmail(values: EmailValues) {
  return await baseConnect('email', values, emailSchema);
}

export async function connectMeta(platform: 'facebook' | 'instagram', values: MetaValues) {
  return await baseConnect(platform, values, metaSchema);
}

export async function connectTwitter(values: TwitterValues) {
  return await baseConnect('twitter', values, twitterSchema);
}
