import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Regression: sign-in used to show the same generic "Incorrect email or password" toast for
 * every auth error, including an unconfirmed account — confusing, since the real problem was
 * "verify your email", not a wrong password. Asserted against the source text rather than
 * mounting the component, which pulls in react-hook-form, the Supabase client, next/navigation
 * and sonner for no benefit here (same rationale as the signup redirect-default test this
 * mirrors in the reviewed LeadsmindCRM codebase).
 */
describe('login form unverified-account message', () => {
  it('distinguishes email_not_confirmed from a generic auth error', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/auth/LoginForm.tsx'), 'utf8');
    expect(src).toContain("authError.code === 'email_not_confirmed'");
    expect(src).toContain('Please verify your email before signing in');
  });
});
