import { createServerClient } from '@/lib/supabase/server';

export async function syncWorkspaceEmails(workspaceId: string) {
  const supabase = await createServerClient();
  
  // 1. Get all active email accounts for this workspace
  const { data: accounts } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('sync_enabled', true);

  if (!accounts || accounts.length === 0) return;

  // 2. Get all contact emails in this workspace to filter sync
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, email')
    .eq('workspace_id', workspaceId)
    .not('email', 'is', null);

  const contactEmails = new Set(contacts?.map(c => c.email?.toLowerCase()) || []);
  const emailToContactId: Record<string, string> = {};
  contacts?.forEach(c => {
    if (c.email) emailToContactId[c.email.toLowerCase()] = c.id;
  });

  for (const account of accounts) {
    try {
      if (account.provider === 'gmail') {
        await syncGmail(account, contactEmails, emailToContactId, workspaceId);
      } else if (account.provider === 'outlook') {
        await syncOutlook(account, contactEmails, emailToContactId, workspaceId);
      }

      // Update last_synced_at
      await supabase
        .from('email_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', account.id);

    } catch (error) {
      console.error(`Sync failed for ${account.email_address}:`, error);
    }
  }
}

async function syncGmail(account: any, contactEmails: Set<string>, emailToContactId: Record<string, string>, workspaceId: string) {
  // Gmail Sync Logic
  // 1. List messages (maybe use q=newer_than:1d or since last_synced_at)
  const q = account.last_synced_at ? `after:${Math.floor(new Date(account.last_synced_at).getTime() / 1000)}` : 'newer_than:1d';
  
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${account.access_token}` }
  });
  const listData = await listRes.json();

  if (!listData.messages) return;

  const supabase = await createServerClient();

  for (const msgInfo of listData.messages) {
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgInfo.id}`, {
      headers: { Authorization: `Bearer ${account.access_token}` }
    });
    const msg = await msgRes.json();

    const headers = msg.payload.headers;
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    
    // Extract email from "Name <email@domain.com>"
    const fromEmail = from.match(/<(.+?)>/)?.[1] || from.split(' ').pop() || '';
    const toEmail = to.match(/<(.+?)>/)?.[1] || to.split(' ').pop() || '';

    const contactId = emailToContactId[fromEmail.toLowerCase()] || emailToContactId[toEmail.toLowerCase()];

    if (contactId) {
      // Save to DB
      await supabase.from('contact_emails').upsert({
        workspace_id: workspaceId,
        contact_id: contactId,
        message_id: msg.id,
        thread_id: msg.threadId,
        subject,
        from_email: fromEmail,
        to_emails: [toEmail],
        body_html: msg.snippet, // Simplified for now, should extract body from payload
        direction: fromEmail.toLowerCase() === account.email_address.toLowerCase() ? 'outbound' : 'inbound',
        sent_at: new Date(parseInt(msg.internalDate)).toISOString()
      }, { onConflict: 'message_id' });
    }
  }
}

async function syncOutlook(account: any, contactEmails: Set<string>, emailToContactId: Record<string, string>, workspaceId: string) {
    // Outlook Sync Logic (Microsoft Graph)
    const filter = account.last_synced_at ? `$filter=receivedDateTime ge ${new Date(account.last_synced_at).toISOString()}` : '';
    const url = `https://graph.microsoft.com/v1.0/me/messages?${filter}`;
    
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${account.access_token}` }
    });
    const data = await res.json();

    if (!data.value) return;

    const supabase = await createServerClient();

    for (const msg of data.value) {
        const fromEmail = msg.from?.emailAddress?.address || '';
        const toEmail = msg.toRecipients?.[0]?.emailAddress?.address || '';
        
        const contactId = emailToContactId[fromEmail.toLowerCase()] || emailToContactId[toEmail.toLowerCase()];

        if (contactId) {
            await supabase.from('contact_emails').upsert({
                workspace_id: workspaceId,
                contact_id: contactId,
                message_id: msg.id,
                thread_id: msg.conversationId,
                subject: msg.subject,
                from_email: fromEmail,
                to_emails: [toEmail],
                body_html: msg.bodyPreview,
                direction: fromEmail.toLowerCase() === account.email_address.toLowerCase() ? 'outbound' : 'inbound',
                sent_at: msg.sentDateTime
            }, { onConflict: 'message_id' });
        }
    }
}

export async function sendViaConnectedAccount(accountId: string, payload: { to: string; subject: string; body: string }) {
  const supabase = await createServerClient();
  const { data: account } = await supabase.from('email_accounts').select('*').eq('id', accountId).single();
  if (!account) throw new Error('Account not found');

  if (account.provider === 'gmail') {
    // Gmail send logic (requires base64 encoded raw email or specific payload)
    const utf8Subject = `=?utf-8?B?${Buffer.from(payload.subject).toString('base64')}?=`;
    const message = [
      `To: ${payload.to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      payload.body
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Gmail send failed: ${JSON.stringify(error)}`);
    }
  } else if (account.provider === 'outlook') {
    const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject: payload.subject,
          body: { contentType: 'HTML', content: payload.body },
          toRecipients: [{ emailAddress: { address: payload.to } }]
        }
      })
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Outlook send failed: ${JSON.stringify(error)}`);
    }
  }
}
