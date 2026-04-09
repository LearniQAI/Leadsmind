import React from 'react'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { ContactFormEmail } from '@/emails/contact-form'

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
