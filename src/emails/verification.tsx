import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  verificationLink?: string;
}

export const VerificationEmail = ({
  verificationLink = 'https://www.leadsmind.io/auth/callback',
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your LeadsMind account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your account</Heading>
        <Text style={text}>
          You&apos;re almost ready to start using LeadsMind. Click the button below to confirm
          your email address.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationLink}>
            Confirm email
          </Button>
        </Section>
        <Text style={text}>
          If you didn&apos;t create this account, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          LeadsMind — The all-in-one CRM + LMS for modern teams.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6c47ff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '14px 7px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  marginTop: '32px',
};
