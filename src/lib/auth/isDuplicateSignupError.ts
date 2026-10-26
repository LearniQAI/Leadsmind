/**
 * Supabase's documented, stable error codes for a duplicate signup
 * (https://supabase.com/docs/guides/auth/debugging/error-codes) — match on these, not on the
 * English error message, which is prose and not an API contract Supabase promises to keep
 * stable. Two distinct codes exist for the same condition: the regular client-side signUp()
 * endpoint returns 'user_already_exists', while admin.generateLink()/admin.createUser() — what
 * signUpBasic() actually calls — returns 'email_exists' instead. Message-match is kept only as a
 * fallback for a response that doesn't populate `code` (older SDK versions, or a non-API error
 * shape).
 */
const DUPLICATE_SIGNUP_CODES = new Set(['user_already_exists', 'email_exists']);

export function isDuplicateSignupError(authError: { code?: string | null; message: string }): boolean {
  if (authError.code) return DUPLICATE_SIGNUP_CODES.has(authError.code);
  return authError.message.toLowerCase().includes('already registered');
}
