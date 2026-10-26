import { describe, expect, it } from 'vitest';
import { isDuplicateSignupError } from './isDuplicateSignupError';

describe('isDuplicateSignupError', () => {
  it("matches Supabase's documented error code for the client-side signUp() endpoint", () => {
    expect(isDuplicateSignupError({ code: 'user_already_exists', message: 'anything at all' })).toBe(true);
  });

  it('matches email_exists — the code admin.generateLink() (signUpBasic) actually returns for a duplicate', () => {
    expect(
      isDuplicateSignupError({
        code: 'email_exists',
        message: 'A user with this email address has already been registered',
      })
    ).toBe(true);
  });

  it('does not match a different error code even if the message happens to mention "registered"', () => {
    expect(isDuplicateSignupError({ code: 'weak_password', message: 'Password already registered as compromised' })).toBe(false);
  });

  it('falls back to a message match only when no code is present', () => {
    expect(isDuplicateSignupError({ message: 'User already registered' })).toBe(true);
    expect(isDuplicateSignupError({ code: null, message: 'User already registered' })).toBe(true);
  });

  it('a genuinely different, code-less error is not treated as a duplicate', () => {
    expect(isDuplicateSignupError({ message: 'Network request failed' })).toBe(false);
  });
});
