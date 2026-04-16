import React from 'react'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { ContactFormEmail } from '@/emails/contact-form'
import { createClient } from '@supabase/supabase-js'

// Note: Use service role key for system-level background actions like lead ingestion
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, subject, message } = body

  const supportEmail = (
    <ContactFormEmail name={name} email={email} subject={subject} message={message} />
  )

  const autoReplyEmail = (
    <div>
      <h1>Hi {name},</h1>
      <p>
        Thanks for reaching out to LeadsMind. We&apos;ve received your message regarding &quot;{subject}&quot; and will
        get back to you within 1 business day.
      </p>
      <p>
        Best regards,<br />
        The LeadsMind Team
      </p>
    </div>
  )

  try {
    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 0. Auto-ingest lead into CRM
    try {
      // Find the "Admin" or first active workspace
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (workspace) {
        // Split name into first/last
        const [firstName, ...lastParts] = name.split(' ');
        const lastName = lastParts.join(' ') || 'Lead';

        await supabaseAdmin.from('contacts').insert({
          workspace_id: workspace.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          source: 'Website Contact Form',
          tags: ['Lead', 'Website'],
        });
      }
    } catch (dbError) {
      console.error('Lead ingestion error (continuing with email):', dbError);
      // We continue since the primary function (email) shouldn't fail due to CRM sync
    }

    // 1. Send notification email to support
    await sendEmail({
      to: 'support@leadsmind.com',
      subject: `New Contact Inquiry: ${subject}`,
      react: supportEmail,
    })

    // 2. Send auto-reply to the user
    await sendEmail({
      to: email,
      subject: 'We received your message!',
      react: autoReplyEmail,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
