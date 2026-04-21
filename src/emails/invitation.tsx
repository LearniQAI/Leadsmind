import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InvitationEmailProps {
  workspaceName?: string;
  inviterName?: string;
  inviteUrl?: string;
  role?: string;
  expiresIn?: string;
  platformName?: string;
  primaryColor?: string;
}

export const InvitationEmail = ({
  workspaceName = 'Workspace',
  inviterName = 'Someone',
  inviteUrl = 'http://localhost:3000/invite/accept',
  role = 'Team Member',
  expiresIn = '48 hours',
  platformName = 'LeadsMind',
  primaryColor = '#6c47ff',
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>{inviterName} invited you to join {workspaceName} on {platformName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>
            {platformName}
          </Text>
        </Section>
        
        <Heading style={h1}>You&apos;re Invited!</Heading>
        
        <Text style={text}>
          Hello,
        </Text>
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join the <strong>{workspaceName}</strong> workspace on {platformName}.
        </Text>
        
        <Section style={roleCard}>
          <Text style={{ ...roleLabel, color: primaryColor }}>YOUR ROLE</Text>
          <Text style={roleValue}>{role}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={{ ...button, backgroundColor: primaryColor }} href={inviteUrl}>
            Accept Invitation
          </Button>
        </Section>
        
        <Text style={subText}>
          This invitation expires in <strong>{expiresIn}</strong>.
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          <strong>{platformName}</strong> — The all-in-one CRM + LMS platform.
        </Text>
        <Text style={footerSub}>
          If you were not expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvitationEmail;

const main = {
  backgroundColor: '#050505',
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#0a0a0a',
  border: '1px solid #1a1a1a',
  borderRadius: '16px',
  margin: '0 auto',
  padding: '40px',
  maxWidth: '560px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logoText = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#ffffff',
  letterSpacing: '-0.5px',
};

const logoAccent = {
  color: '#fdab3d',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const text = {
  color: '#a0a0a0',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
};

const roleCard = {
  backgroundColor: '#111111',
  borderRadius: '12px',
  padding: '16px 24px',
  margin: '24px 0',
  border: '1px solid #1f1f1f',
  textAlign: 'center' as const,
};

const roleLabel = {
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 4px',
};

const roleValue = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6c47ff',
  borderRadius: '100px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const subText = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const hr = {
  borderTop: '1px solid #1a1a1a',
  margin: '32px 0',
};

const footer = {
  color: '#888888',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0',
};

const footerSub = {
  color: '#444444',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '8px',
};
