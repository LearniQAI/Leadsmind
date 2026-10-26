import { describe, expect, it, vi, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Real network calls against the isolated dev Supabase project only (never Production) — the
// email provider is mocked so these tests never send a real email.
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue({ id: 'test' }) }));

import { signUpBasic, forgotPassword } from './auth';
import { sendEmail } from '@/lib/email';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anonKey || !serviceKey) {
  throw new Error('Isolated dev Supabase credentials are missing from .env.local — refusing to run live auth tests without them.');
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

function testEmail(label: string) {
  return `learniqai-review-${label}-${Date.now()}@example.com`;
}

/** Removes a test user and any workspace/membership rows it owns — leaves no stray data in the
 * isolated dev project. */
async function cleanupTestUser(userId: string | undefined) {
  if (!userId) return;
  const { data: owned } = await admin.from('workspaces').select('id').eq('owner_id', userId);
  const workspaceIds = (owned ?? []).map((w) => w.id);
  if (workspaceIds.length > 0) {
    await admin.from('workspace_members').delete().in('workspace_id', workspaceIds);
    await admin.from('workspaces').delete().in('id', workspaceIds);
  }
  await admin.from('workspace_members').delete().eq('user_id', userId);
  await admin.from('users').delete().eq('id', userId);
  await admin.auth.admin.deleteUser(userId);
}

describe('signup, duplicate signup, and plan assignment (live, isolated dev project)', () => {
  const email = testEmail('signup');
  const password = 'Test-Password-123!';
  let userId: string | undefined;

  afterAll(async () => {
    await cleanupTestUser(userId);
  });

  it('creates an unconfirmed user and sends the branded confirmation email', async () => {
    const result = await signUpBasic({ email, password, fullName: 'Review Branch Test' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    userId = result.userId;

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: email, subject: 'Confirm your LeadsMind account' })
    );

    const { data } = await admin.auth.admin.getUserById(userId!);
    expect(data.user?.email_confirmed_at).toBeFalsy();
  });

  it('rejects a duplicate signup with the friendly message, not a generic error', async () => {
    // admin.generateLink(type:'signup') only errors on a duplicate once the existing account is
    // confirmed — resubmitting for a still-unconfirmed signup just reissues a link, matching
    // Supabase's documented behavior. Confirm first so this actually exercises the email_exists
    // path isDuplicateSignupError() is for.
    await admin.auth.admin.updateUserById(userId!, { email_confirm: true });

    const result = await signUpBasic({ email, password, fullName: 'Review Branch Test' });
    expect(result).toEqual({ success: false, error: 'An account with this email already exists. Try logging in.' });
  });

  it('provisions the workspace on the current free plan tier (spark), not a stale value', async () => {
    // Workspace provisioning for a brand-new signup happens via the DB trigger / dashboard
    // auto-create fallback, not signUpBasic() itself (there is never an immediate session to
    // act on) — poll briefly for the trigger to land.
    let ws: { plan: string; plan_tier: string } | null = null;
    for (let attempt = 0; attempt < 10 && !ws; attempt++) {
      const { data: membership } = await admin
        .from('workspace_members')
        .select('workspaces(plan, plan_tier)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      ws = (membership?.workspaces as unknown as { plan: string; plan_tier: string } | null) ?? null;
      if (!ws) await new Promise((r) => setTimeout(r, 300));
    }
    expect(ws).toBeTruthy();
    expect(ws?.plan).toBe('spark');
    expect(ws?.plan_tier).toBe('spark');
  });
});

describe('email confirmation token_hash flow (live, isolated dev project)', () => {
  const email = testEmail('confirm');
  const password = 'Test-Password-123!';
  let userId: string | undefined;

  afterAll(async () => {
    await cleanupTestUser(userId);
  });

  it('a signup generateLink token_hash verifies via verifyOtp and confirms the account — the exact mechanism /auth/callback relies on', async () => {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { data: { full_name: 'Confirm Flow Test' } },
    });
    expect(error).toBeNull();
    if (!data?.properties) throw new Error('generateLink returned no data');
    userId = data.user?.id;
    expect(data.user?.email_confirmed_at).toBeFalsy();

    const anon = createClient(url, anonKey);
    const { error: verifyError } = await anon.auth.verifyOtp({
      token_hash: data.properties.hashed_token,
      type: 'signup',
    });
    expect(verifyError).toBeNull();

    const { data: refreshed } = await admin.auth.admin.getUserById(userId!);
    expect(refreshed.user?.email_confirmed_at).toBeTruthy();
  });
});

describe('password reset (live, isolated dev project)', () => {
  it('generates a recovery link and sends the branded reset email for an existing user', async () => {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1 });
    const existing = data.users[0];
    expect(existing).toBeTruthy();

    const result = await forgotPassword(existing.email!);
    expect(result).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: existing.email, subject: 'Reset your LeadsMind password' })
    );
  });

  it('returns the same generic response for an email that does not exist (anti-enumeration)', async () => {
    const result = await forgotPassword(`no-such-user-${Date.now()}@example.com`);
    expect(result).toEqual({ success: true });
  });
});

describe('login, unverified-account error code, and session persistence (live, isolated dev project)', () => {
  const email = testEmail('login');
  const password = 'Test-Password-123!';
  let userId: string | undefined;
  const anon = createClient(url, anonKey);

  afterAll(async () => {
    await cleanupTestUser(userId);
  });

  it('signInWithPassword returns the email_not_confirmed code for an unconfirmed account', async () => {
    const { data, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: false });
    expect(createError).toBeNull();
    userId = data?.user?.id;

    const { error } = await anon.auth.signInWithPassword({ email, password });
    expect(error?.code).toBe('email_not_confirmed');
  });

  it('signInWithPassword succeeds once confirmed, and the session persists across a later request', async () => {
    await admin.auth.admin.updateUserById(userId!, { email_confirm: true });

    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    expect(error).toBeNull();
    expect(data.session?.access_token).toBeTruthy();

    // What @supabase/ssr's cookie-backed server client does on every later request: resolve the
    // user from the persisted access token rather than re-authenticating.
    const { data: userData, error: userError } = await anon.auth.getUser(data.session!.access_token);
    expect(userError).toBeNull();
    expect(userData.user?.id).toBe(userId);
  });
});
