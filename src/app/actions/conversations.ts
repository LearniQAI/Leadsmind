'use server'

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function getConversations() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      platform,
      title,
      external_thread_id,
      last_message_at,
      contact_id,
      contacts ( first_name, last_name, avatar_url )
    `)
    .eq('workspace_id', workspaceId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
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
    .eq('workspace_id', workspaceId)
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data || [];
}

export async function sendChatMessage(conversationId: string, content: string) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'Not authenticated' };

  const supabase = await createServerClient();
  
  // 1. Get conversation details and platform
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('platform, external_thread_id, contact_id')
    .eq('id', conversationId)
    .single();

  if (convErr || !conv) return { success: false, error: 'Conversation not found' };

  // 2. Get platform credentials
  const { data: conn, error: connErr } = await supabase
    .from('platform_connections')
    .select('credentials')
    .eq('workspace_id', workspaceId)
    .eq('platform', conv.platform)
    .single();

  if (connErr || !conn) return { success: false, error: `Platform ${conv.platform} not connected` };

  // 3. Actually send the message via provider API
  let externalId = `mock-ext-id-${Date.now()}`;
  let status = 'sent';

  try {
    if (conv.platform === 'sms' || conv.platform === 'whatsapp') {
      const twilio = require('twilio');
      const client = twilio(conn.credentials.accountSid, conn.credentials.authToken);
      const to = conv.platform === 'whatsapp' && !conv.external_thread_id.startsWith('whatsapp:') 
        ? `whatsapp:${conv.external_thread_id}` 
        : conv.external_thread_id;
      const from = conv.platform === 'whatsapp' && !conn.credentials.phoneNumber.startsWith('whatsapp:')
        ? `whatsapp:${conn.credentials.phoneNumber}` 
        : conn.credentials.phoneNumber;
      
      const msg = await client.messages.create({ body: content, from, to });
      externalId = msg.sid;
    } else if (conv.platform === 'twitter') {
      const { TwitterApi } = require('twitter-api-v2');
      const client = new TwitterApi({
        appKey: conn.credentials.apiKey,
        appSecret: conn.credentials.apiSecret,
        accessToken: conn.credentials.accessToken,
        accessSecret: conn.credentials.accessSecret,
      });
      const res = await client.v1.sendDm({ recipient_id: conv.external_thread_id, text: content });
      externalId = res.event?.id || externalId;
    } else if (conv.platform === 'facebook' || conv.platform === 'instagram') {
      const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${conn.credentials.accessToken}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: conv.external_thread_id },
          message: { text: content }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      externalId = data.message_id || externalId;
    }
  } catch (err: any) {
    console.error(`[messaging] Send error for ${conv.platform}:`, err);
    return { success: false, error: `Failed to send message: ${err.message}` };
  }

  // 4. Save to messages table
  const { data: dbMsg, error: insertErr } = await supabase
    .from('messages')
    .insert({
      workspace_id: workspaceId,
      conversation_id: conversationId,
      direction: 'outbound',
      content,
      status,
      external_id: externalId
    })
    .select()
    .single();

  if (insertErr) return { success: false, error: 'Message sent but failed to save to DB' };

  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);

  return { success: true, message: dbMsg };
}
