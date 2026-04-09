import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ContactFormEmailProps {
  name: string
  email: string
  subject: string
  message: string
}

export const ContactFormEmail = ({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) => (
  <Html>
    <Head />
    <Preview>New message from {name} via LeadsMind Contact Form</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Inquiry</Heading>
        <Text style={text}>
          You have received a new message from the LeadsMind contact form.
        </Text>
        <Section style={section}>
          <Text style={label}>From:</Text>
          <Text style={value}>{name} ({email})</Text>
          
          <Text style={label}>Subject:</Text>
          <Text style={value}>{subject}</Text>
          
          <Hr style={hr} />
          
          <Text style={label}>Message:</Text>
          <Text style={messageText}>{message}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          LeadsMind CMS & LMS Platform | Internal Notification
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ContactFormEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const section = {
  padding: '0 48px',
}

const label = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
}

const value = {
  fontSize: '16px',
  color: '#333',
  marginBottom: '20px',
}

const messageText = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '24px',
}
