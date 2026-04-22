import { Resend } from 'resend'

interface SendEmailProps {
  to: string | string[]
  subject: string
  react: React.ReactElement
  text?: string
  config?: {
    apiKey?: string | null
    fromEmail?: string | null
    fromName?: string | null
  }
}

export async function sendEmail({ to, subject, react, text, config }: SendEmailProps) {
  const apiKey = config?.apiKey || process.env.RESEND_API_KEY
  const fromAddress = config?.fromEmail || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const fromName = config?.fromName || 'LeadsMind'
  
  if (!apiKey || apiKey === 're_123' || apiKey.includes('PLACEHOLDER')) {
    console.log('--- EMAIL SANDBOX MODE ---')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body (Text): ${text || 'React component provided'}`)
    console.log('--- CONFIGURE RESEND_API_KEY TO SEND REAL EMAILS ---')
    return { id: 'mock_id_' + Date.now() }
  }

  const resend = new Resend(apiKey)
  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to,
      subject,
      react: react as any,
      text: text || '',
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}
