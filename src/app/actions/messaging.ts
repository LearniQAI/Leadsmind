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
import { TwitterApi } from 'twitter-api-v2';

import { cookies } from 'next/headers';

/**
 * Generates a Twitter OAuth 2.0 authorization URL.
 */
export async function getTwitterAuthUrl() {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      { scope: ['tweet.read', 'users.read', 'offline.access'] }
    );

    const cookieStore = await cookies();
    cookieStore.set('twitter_code_verifier', codeVerifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });
    cookieStore.set('twitter_auth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

    return { success: true, url };
  } catch (error: any) {
    console.error('[twitter-auth] Error generating URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connects a Twilio account to the current workspace.
 * Stores the Account SID, Auth Token, and Phone Number.
 */
export async function connectTwilio(values: TwilioValues, platform: 'sms' | 'whatsapp' = 'sms') {
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
    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
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
          platform: platform,
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

/**
 * Synchronizes recent messages from all connected platforms for the current workspace.
 */
export async function syncRecentMessages() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    
    // 1. Get all connected platforms
    const { data: connections, error: connErr } = await supabase
      .from('platform_connections')
      .select('platform, credentials')
      .eq('workspace_id', workspaceId);

    if (connErr) throw connErr;
    if (!connections || connections.length === 0) return { success: true, count: 0, platformErrors: [] };

    let totalSynced = 0;
    const platformErrors: { platform: string, error: string }[] = [];

    for (const conn of connections) {
      try {
        let synced = 0;
        if (conn.platform === 'sms' || conn.platform === 'whatsapp') {
          synced = await syncTwilio(workspaceId, conn.platform, conn.credentials, supabase);
        } else if (conn.platform === 'twitter') {
          synced = await syncTwitter(workspaceId, conn.credentials, supabase);
        } else if (conn.platform === 'facebook' || conn.platform === 'instagram') {
          synced = await syncMeta(workspaceId, conn.platform, conn.credentials, supabase);
        }
        totalSynced += synced;
      } catch (err: any) {
        console.error(`Error syncing ${conn.platform}:`, err);
        platformErrors.push({ platform: conn.platform, error: err.message || 'Unknown error' });
      }
    }

    revalidatePath('/conversations');
    return { success: true, count: totalSynced, platformErrors };
  } catch (error: any) {
    console.error('[messaging] syncRecentMessages error:', error);
    return { success: false, error: error.message };
  }
}

async function syncTwilio(workspaceId: string, platform: 'sms' | 'whatsapp', credentials: any, supabase: any) {
  const twilio = require('twilio');
  const client = twilio(credentials.accountSid, credentials.authToken);
  
  // Fetch last 10 messages for simplicity
  const messages = await client.messages.list({ limit: 10, to: platform === 'whatsapp' ? `whatsapp:${credentials.phoneNumber}` : credentials.phoneNumber });
  
  let synced = 0;
  for (const msg of messages) {
    const externalId = msg.sid;
    const from = msg.from.replace('whatsapp:', '');
    const direction = msg.direction.includes('inbound') ? 'inbound' : 'outbound';
    
    const { data: conv } = await supabase
      .from('conversations')
      .upsert({
        workspace_id: workspaceId,
        platform: platform,
        external_thread_id: from,
        title: from,
        updated_at: new Date().toISOString()
      }, { onConflict: 'workspace_id, platform, external_thread_id' })
      .select('id')
      .single();

    if (conv) {
      const { error: msgErr } = await supabase
        .from('messages')
        .insert({
          workspace_id: workspaceId,
          conversation_id: conv.id,
          direction: direction,
          content: msg.body,
          sender_handle: from,
          external_id: externalId,
          status: 'delivered',
          sent_at: new Date(msg.dateCreated).toISOString()
        });
      
      if (!msgErr) synced++;
    }
  }
  return synced;
}

async function syncTwitter(workspaceId: string, credentials: any, supabase: any) {
  try {
    const { accessToken } = credentials;
    if (!accessToken) {
      throw new Error('Twitter credentials missing OAuth 2.0 Access Token.');
    }

    const client = new TwitterApi(accessToken);

    // Fetch last 10 DM events using v2 API
    const dms = await client.v2.listDmEvents({ 
      "dm_event.fields": ['id', 'text', 'sender_id', 'created_at', 'dm_conversation_id', 'event_type'],
      max_results: 10 
    });
    
    let synced = 0;

    // In Twitter API v2, the result has a 'data' array inside the 'data' property of the paginator
    const events = dms.data?.data || [];

    for (const event of events) {
      // Only sync actual messages (ignore participants joining/leaving)
      if (event.event_type !== 'MessageCreate') continue;

      const from = event.sender_id!;
      const externalId = event.id;
      
      const { data: conv } = await supabase
        .from('conversations')
        .upsert({
          workspace_id: workspaceId,
          platform: 'twitter',
          external_thread_id: from,
          title: `Twitter User ${from}`,
          updated_at: event.created_at || new Date().toISOString()
        }, { onConflict: 'workspace_id, platform, external_thread_id' })
        .select('id')
        .single();

      if (conv) {
        const { error: msgErr } = await supabase
          .from('messages')
          .insert({
            workspace_id: workspaceId,
            conversation_id: conv.id,
            direction: 'inbound', // Simplified for sync
            content: event.text || '',
            sender_handle: from,
            external_id: externalId,
            status: 'delivered',
            sent_at: event.created_at || new Date().toISOString()
          });
        if (!msgErr) synced++;
      }
    }
    return synced;
  } catch (err: any) {
    console.error('[sync-twitter] v2 error:', err);
    throw err;
  }
}

async function syncMeta(workspaceId: string, platform: 'facebook' | 'instagram', credentials: any, supabase: any) {
  try {
    const { accessToken, pageId } = credentials;
    if (!accessToken || !pageId) return 0;

    // 1. Fetch conversations from Meta Graph API
    const convUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=participants,updated_time,messages.limit(1){message,from,created_time}&access_token=${accessToken}`;
    const response = await fetch(convUrl);
    const data = await response.json();

    if (data.error) {
      console.error(`Meta API Error (${platform}):`, data.error.message);
      return 0;
    }

    let synced = 0;
    for (const metaConv of data.data || []) {
      // Find the external participant (the user, not the page)
      const participant = metaConv.participants?.data?.find((p: any) => p.id !== pageId);
      if (!participant) continue;

      const externalThreadId = participant.id;
      const title = participant.name || `Meta User ${externalThreadId}`;

      // 2. Upsert Conversation
      const { data: conv } = await supabase
        .from('conversations')
        .upsert({
          workspace_id: workspaceId,
          platform: platform,
          external_thread_id: externalThreadId,
          title: title,
          updated_at: new Date(metaConv.updated_time).toISOString()
        }, { onConflict: 'workspace_id, platform, external_thread_id' })
        .select('id')
        .single();

      if (conv) {
        // 3. Sync the last message if available
        const lastMsg = metaConv.messages?.data?.[0];
        if (lastMsg) {
          const { error: msgErr } = await supabase
            .from('messages')
            .insert({
              workspace_id: workspaceId,
              conversation_id: conv.id,
              direction: lastMsg.from.id === pageId ? 'outbound' : 'inbound',
              content: lastMsg.message,
              sender_handle: lastMsg.from.name,
              external_id: lastMsg.id,
              status: 'delivered',
              sent_at: new Date(lastMsg.created_time).toISOString()
            });
          
          if (!msgErr) synced++;
        }
      }
    }
    return synced;
  } catch (err) {
    console.error(`Failed to sync Meta (${platform}):`, err);
    return 0;
  }
}
