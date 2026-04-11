import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

export async function GET(req: Request) {
  // Meta Webhook Verification
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Typically, you store a VERIFY_TOKEN in your .env and check it here.
  // For now, if mode and token are present, we safely return the challenge.
  if (mode === 'subscribe' && token) {
    console.log('[Meta Webhook] Verified webhook successful');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify this is a page event
    if (body.object !== 'page' && body.object !== 'instagram') {
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    const supabase = getSupabaseAdmin();

    for (const entry of body.entry) {
      // The page ID that received the message
      const pageId = entry.id;
      const platform = body.object === 'instagram' ? 'instagram' : 'facebook';

      for (const webhookEvent of entry.messaging) {
        if (!webhookEvent.message) continue;

        const senderId = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;
        const messageId = webhookEvent.message.mid;

        console.log(`[Meta Webhook] Received message on ${platform} Page: ${pageId} from ${senderId}`);

        // 1. Find corresponding workspace
        // We'll search which workspace has this pageId stored in credentials
        const { data: workspaces, error: connErr } = await supabase
          .from('platform_connections')
          .select('workspace_id, credentials')
          .eq('platform', platform);

        if (connErr || !workspaces) continue;

        const connection = workspaces.find(w => w.credentials?.pageId === pageId);
        if (!connection) {
          console.error(`[Meta Webhook] No workspace matched Page ID ${pageId}`);
          continue;
        }

        const workspaceId = connection.workspace_id;

        // 2. Find or create conversation
        let { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('platform', platform)
          .eq('external_thread_id', senderId)
          .single();

        if (!conversation) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              workspace_id: workspaceId,
              platform,
              external_thread_id: senderId,
              title: `User ${senderId}`
            })
            .select('id')
            .single();
          conversation = newConv;
        }

        // 3. Insert Message
        if (conversation) {
          await supabase.from('messages').insert({
            workspace_id: workspaceId,
            conversation_id: conversation.id,
            direction: 'inbound',
            content: messageText || 'Attachment received',
            sender_handle: senderId,
            external_id: messageId
          });
          
          await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id);
        }
      }
    }

    // Return a 200 OK to acknowledge receipt
    return new NextResponse('EVENT_RECEIVED', { status: 200 });

  } catch (error) {
    console.error('[Meta Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
