import { describe, expect, it } from 'vitest';
import { render } from '@react-email/render';
import { PasswordResetEmail } from './password-reset';

describe('PasswordResetEmail', () => {
  it('renders the reset link into the email body', async () => {
    const link = 'https://example.com/auth/callback?token_hash=abc123&type=recovery&next=%2Freset-password';
    const html = await render(PasswordResetEmail({ resetLink: link }));
    expect(html).toContain('href="https://example.com/auth/callback?token_hash=abc123&amp;type=recovery&amp;next=%2Freset-password"');
    expect(html).toContain('Reset your password');
  });
});
