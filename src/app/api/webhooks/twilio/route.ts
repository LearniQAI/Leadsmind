import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client with the Service Role key to bypass RLS for webhooks
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

export async function POST(req: Request) {
  try {
    // Twilio sends webhook payloads as URL-encoded form data
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    const from = params.get('From'); // Sender's phone number
    const to = params.get('To'); // Your Twilio phone number
    const body = params.get('Body'); // Message content
    const messageId = params.get('SmsMessageSid') || params.get('MessageSid');

    if (!from || !to || !body) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const isWhatsApp = from.startsWith('whatsapp:');
    const platform = isWhatsApp ? 'whatsapp' : 'sms';
    
    // Normalize logic for WhatsApp
    const normalizedFrom = isWhatsApp ? from.replace('whatsapp:', '') : from;
    const normalizedTo = isWhatsApp ? to.replace('whatsapp:', '') : to;

    console.log(`[Twilio Webhook] Received ${platform} from ${normalizedFrom} to ${normalizedTo}`);

    const supabase = getSupabaseAdmin();

    // 1. Find which workspace owns this Twilio 'To' number
    const { data: connection, error: connErr } = await supabase
      .from('platform_connections')
      .select('workspace_id')
      .eq('platform', platform === 'whatsapp' ? 'whatsapp' : 'sms')
      // Note: In a production app, we would explicitly match credentials->phoneNumber
      .single();

    if (connErr || !connection) {
      console.error('No matching workspace found for this Twilio number:', connErr);
      return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' }});
    }

    const workspaceId = connection.workspace_id;

    // 2. Find or create the conversation thread
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .eq('external_thread_id', normalizedFrom)
      .single();

    if (!conversation) {
      const { data: newConv, error: newConvErr } = await supabase
        .from('conversations')
        .insert({
          workspace_id: workspaceId,
          platform,
          external_thread_id: normalizedFrom,
          title: normalizedFrom
        })
        .select('id')
        .single();
        
      if (newConvErr) throw newConvErr;
      conversation = newConv;
    }

    // 3. Store the incoming message
    await supabase.from('messages').insert({
      workspace_id: workspaceId,
      conversation_id: conversation.id,
      direction: 'inbound',
      content: body,
      sender_handle: normalizedFrom,
      status: 'delivered',
      external_id: messageId
    });
    
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id);

    // Return empty TwiML response to acknowledge receipt
    return new NextResponse('<Response></Response>', {
      headers: {
        'Content-Type': 'text/xml',
      },
      status: 200
    });

  } catch (error: any) {
    console.error('[Twilio Webhook] Error processing incoming message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
