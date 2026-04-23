'use server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin, getCurrentWorkspaceId } from '@/lib/auth';
import { 
  twilioSchema, TwilioValues,
  emailSchema, EmailValues,
  metaSchema, MetaValues,
  linkedinSchema, LinkedinValues,
  tiktokSchema, TiktokValues
} from '@/lib/validations/messaging.schema';
import { revalidatePath } from 'next/cache';

import { cookies } from 'next/headers';

/**
 * Generates a LinkedIn OAuth 2.0 authorization URL.
 */
export async function getLinkedInAuthUrl() {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
    const state = Math.random().toString(36).substring(7);
    const scope = 'w_member_social r_liteprofile r_emailaddress'; // Adjust scopes for messages if available

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    const cookieStore = await cookies();
    cookieStore.set('linkedin_auth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generates a TikTok OAuth 2.0 authorization URL.
 */
export async function getTikTokAuthUrl() {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;
    const state = Math.random().toString(36).substring(7);
    const scope = 'user.info.basic,video.list,video.upload,video.publish';

    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(scope)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    const cookieStore = await cookies();
    cookieStore.set('tiktok_auth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

    return { success: true, url };
  } catch (error: any) {
    console.error('[tiktok-auth] Error generating URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generates a Meta (Facebook/Instagram) OAuth authorization URL.
 */
export async function getMetaAuthUrl() {
  try {
    const clientId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;
    const state = Math.random().toString(36).substring(7);
    // Requesting permissions for pages and instagram posting
    const scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,public_profile,instagram_basic,instagram_content_publish';

    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    const cookieStore = await cookies();
    cookieStore.set('meta_auth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

    return { success: true, url };
  } catch (error: any) {
    console.error('[meta-auth] Error generating URL:', error);
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

export async function connectLinkedIn(values: LinkedinValues) {
  return await baseConnect('linkedin', values, linkedinSchema);
}

export async function connectTikTok(values: TiktokValues) {
  return await baseConnect('tiktok', values, tiktokSchema);
}

/**
 * Synchronizes recent messages from all connected platforms for the current workspace.
 */
export async function syncRecentMessages() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    console.log('[syncRecentMessages] workspaceId used for sync:', workspaceId);
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
        } else if (conn.platform === 'linkedin') {
          synced = await syncLinkedIn(workspaceId, conn.credentials, supabase);
        } else if (conn.platform === 'email') {
          synced = await syncGmail(workspaceId, supabase);
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
  
  // Fetch all messages (both directions) to built complete threads
  const messages = await client.messages.list({ limit: 20 });
  
  let synced = 0;
  for (const msg of messages) {
    const direction = msg.direction.includes('inbound') ? 'inbound' : 'outbound';
    
    // The thread ID should always be the RECIPIENT if we sent it, or the SENDER if we received it
    // i.e., the "Other Person's" number
    const otherPersonNumber = (direction === 'inbound' ? msg.from : msg.to).replace('whatsapp:', '');
    
    // Only process if this message belongs to the platform we are currently syncing
    const isWhatsAppMsg = msg.from?.startsWith('whatsapp:') || msg.to?.startsWith('whatsapp:');
    if (platform === 'whatsapp' && !isWhatsAppMsg) continue;
    if (platform === 'sms' && isWhatsAppMsg) continue;

    const { data: conv } = await supabase
      .from('conversations')
      .upsert({
        workspace_id: workspaceId,
        platform: platform,
        external_thread_id: otherPersonNumber,
        title: otherPersonNumber,
        last_message_at: new Date(msg.dateCreated).toISOString(),
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
          sender_handle: msg.from.replace('whatsapp:', ''),
          external_id: msg.sid,
          status: 'delivered',
          sent_at: new Date(msg.dateCreated).toISOString()
        });
      
      if (!msgErr) synced++;
    }
  }
  return synced;
}

async function syncLinkedIn(workspaceId: string, credentials: any, supabase: any) {
  try {
    const { accessToken } = credentials;
    if (!accessToken) {
      throw new Error('LinkedIn credentials missing Access Token.');
    }

    // Mock LinkedIn sync - LinkedIn Messaging API is restricted usually
    // In a real scenario, you'd fetch from https://api.linkedin.com/v2/messages
    console.log('Syncing LinkedIn for workspace:', workspaceId);
    
    return 0; // Returning 0 as it's a mock for now
  } catch (err: any) {
    console.error('[sync-linkedin] error:', err);
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
async function syncGmail(workspaceId: string, supabase: any) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials (CLIENT_ID/SECRET) are missing in environment variables.');
    }
    console.log(`[sync-gmail] Starting sync for workspace: ${workspaceId}`);
    const { getGmailService } = require('@/lib/google/gmail');
    const gmailService = await getGmailService(workspaceId);
    
    console.log('[sync-gmail] Fetching recent threads...');
    const gmailData = await gmailService.getThreads(5);
    console.log('[sync-gmail] Google API response:', JSON.stringify(gmailData));
    
    const threads = gmailData.threads;
    if (!threads || !Array.isArray(threads)) {
      console.log('[sync-gmail] No threads found or invalid response structure');
      return 0;
    }

    console.log(`[sync-gmail] Found ${threads.length} threads. Processing details...`);
    let synced = 0;
    for (const thread of threads) {
      const detail = await gmailService.getMessage(thread.id);
      const headers = detail.payload.headers;
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();
      const snippet = detail.snippet;

      // Extract raw email from "Name <email@domain.com>"
      const emailMatch = from.match(/<(.+)>$/);
      const email = emailMatch ? emailMatch[1] : from;

      // 1. Upsert Conversation
      const { data: conv } = await supabase
        .from('conversations')
        .upsert({
          workspace_id: workspaceId,
          platform: 'email',
          external_thread_id: thread.id, // Group by actual Google Thread ID
          title: subject,
          last_message_at: new Date(date).toISOString(),
          updated_at: new Date(date).toISOString()
        }, { onConflict: 'workspace_id, platform, external_thread_id' })
        .select('id')
        .single();

      if (conv) {
        console.log(`[sync-gmail] Conversation upserted: ${conv.id}. Upserting message...`);
        // 2. Insert Message (if not already exists)
        const { error: msgErr } = await supabase
          .from('messages')
          .upsert({
            workspace_id: workspaceId,
            conversation_id: conv.id,
            direction: 'inbound', // Simplified for sync
            content: snippet,
            sender_handle: from,
            external_id: thread.id,
            status: 'delivered',
            sent_at: new Date(date).toISOString()
          }, { onConflict: 'external_id' });
        
        if (!msgErr) {
          synced++;
        } else {
          console.error('[sync-gmail] Message upsert error:', msgErr);
        }
      } else {
        console.error('[sync-gmail] Failed to upsert conversation for email:', email);
      }
    }
    console.log(`[sync-gmail] Sync complete. Total synced: ${synced}`);
    return synced;
  } catch (err: any) {
    console.error('[sync-gmail] Critical error during sync:', err.message);
    throw err; // Re-throw to be caught by syncRecentMessages
  }
}

// --- Conversation & Chat Management ---

export async function getConversations() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*, contacts(first_name, last_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[messaging] Error fetching conversations:', error);
    return [];
  }
  return data || [];
}

export async function getMessages(conversationId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('workspace_id', workspaceId)
    .order('sent_at', { ascending: true });

  if (error) {
    console.error('[messaging] Error fetching messages:', error);
    return [];
  }
  return data || [];
}

export async function sendChatMessage(conversationId: string, content: string) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
    if (!conv) return { success: false, error: 'Conversation not found' };

    // 1. Save message to DB
    const { data: msg, error } = await supabase
      .from('messages')
      .insert({
        workspace_id: workspaceId,
        conversation_id: conversationId,
        direction: 'outbound',
        content,
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Delegate to platform-specific send logic
    let sendResult: { success: boolean; error?: string } = { success: false, error: 'Platform not supported for outgoing messages yet' };
    
    if (conv.platform === 'sms' || conv.platform === 'whatsapp') {
      sendResult = await sendTwilioMessage(conv, content);
    } else if (conv.platform === 'email') {
      sendResult = await sendEmailMessage(conv, content);
    }

    if (sendResult.success) {
      await supabase.from('messages').update({ status: 'delivered' }).eq('id', msg.id);
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
    } else {
      await supabase.from('messages').update({ status: 'failed' }).eq('id', msg.id);
    }

    revalidatePath('/conversations');
    return sendResult;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getContacts() {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return [];
    const supabase = await createServerClient();
    const { data } = await supabase.from('contacts').select('*').eq('workspace_id', workspaceId).order('first_name');
    return data || [];
}

export async function startConversation(contactId: string, platform: string, externalId: string) {
    try {
        const workspaceId = await getCurrentWorkspaceId();
        if (!workspaceId) return { success: false, error: 'No workspace' };
        const supabase = await createServerClient();

        const { data, error } = await supabase
            .from('conversations')
            .upsert({
                workspace_id: workspaceId,
                platform,
                external_thread_id: externalId,
                contact_id: contactId,
                title: externalId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'workspace_id, platform, external_thread_id' })
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

async function sendTwilioMessage(conv: any, content: string) {
  try {
    const supabase = await createServerClient();
    const { data: conn } = await supabase
      .from('platform_connections')
      .select('credentials')
      .eq('workspace_id', conv.workspace_id)
      .eq('platform', conv.platform)
      .single();

    if (!conn?.credentials) throw new Error('Platform not connected or credentials missing');
    
    const { accountSid, authToken, phoneNumber } = conn.credentials;
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: content,
      from: conv.platform === 'whatsapp' ? `whatsapp:${phoneNumber}` : phoneNumber,
      to: conv.platform === 'whatsapp' ? `whatsapp:${conv.external_thread_id}` : conv.external_thread_id
    });

    return { success: true };
  } catch (err: any) {
    console.error('[twilio-send] Failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendEmailMessage(conv: any, content: string) {
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
        to: conv.external_thread_id, // Assume email is stored here for email platform
        subject: conv.title || 'New message from platform',
        text: content
    });
    return { success: true };
}
