import { Resend } from 'resend'

interface SendEmailProps {
  to: string | string[]
  subject: string
  react: React.ReactElement
  text?: string
}

export async function sendEmail({ to, subject, react, text }: SendEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { data, error } = await resend.emails.send({
      from: 'LeadsMind <onboarding@resend.dev>', // Update with verified domain in production
      to,
      subject,
      react,
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
