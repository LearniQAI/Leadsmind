import { describe, expect, it } from 'vitest';
import { render } from '@react-email/render';
import { VerificationEmail } from './verification';

describe('VerificationEmail', () => {
  it('renders the verification link into the email body', async () => {
    const link = 'https://example.com/auth/callback?token_hash=abc123&type=signup&next=%2Fdashboard';
    const html = await render(VerificationEmail({ verificationLink: link }));
    expect(html).toContain('href="https://example.com/auth/callback?token_hash=abc123&amp;type=signup&amp;next=%2Fdashboard"');
    expect(html).toContain('Confirm your account');
  });
});
