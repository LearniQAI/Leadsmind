'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createElement } from 'react';
import { isDuplicateSignupError } from '@/lib/auth/isDuplicateSignupError';
import { safeInternalPath } from '@/lib/security/safeInternalPath';
import { VerificationEmail } from '@/emails/verification';
import { PasswordResetEmail } from '@/emails/password-reset';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Called after signup. Creates the user profile + workspace in our DB tables.
 * NOTE: This is now a fallback — the primary path is the DB trigger handle_new_user().
 * This function should NEVER block the signup flow even if it partially fails.
 */
export async function setupWorkspace(payload: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  workspaceName: string;
}) {
  const supabase = await createServerClient();

  try {
    // 1. Upsert user record - use ON CONFLICT behaviour
    const { error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: payload.userId,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    // Log but DON'T block — the DB trigger may have already created it
    if (userError) {
      console.warn('[setupWorkspace] User upsert warning (may already exist):', userError.message);
    }

    // 2. Check if user already has a workspace (trigger may have created one)
    const { data: existingMembership } = await supabase
      .from('workspace_members')
      .select('workspace_id, workspaces(id, name)')
      .eq('user_id', payload.userId)
      .limit(1)
      .single();

    if (existingMembership) {
      // Workspace already exists (created by trigger)
      const ws = existingMembership.workspaces as unknown as { id: string; name: string };
      return { success: true, workspaceId: ws?.id || existingMembership.workspace_id };
    }

    // 3. Create workspace only if one doesn't exist yet
    const baseSlug = slugify(payload.workspaceName);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: payload.workspaceName,
        slug,
        owner_id: payload.userId,
        plan: 'spark',
      })
      .select('id, name')
      .single();

    if (workspaceError) {
      console.error('[setupWorkspace] Workspace creation error:', workspaceError);
      // Try to recover — maybe slug collision; fetch any workspace for this user
      const { data: fallback } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', payload.userId)
        .limit(1)
        .single();

      if (fallback) {
        return { success: true, workspaceId: fallback.workspace_id };
      }
      return { success: false, error: 'Failed to create workspace' };
    }

    // 4. Add as admin member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspace.id, user_id: payload.userId, role: 'admin' });

    if (memberError && !memberError.message.includes('duplicate')) {
      console.warn('[setupWorkspace] Member insert warning:', memberError.message);
    }

    revalidatePath('/(dashboard)', 'layout');

    // Send Branded Welcome Email
    try {
      await sendEmail({
        to: payload.email,
        subject: `Welcome to LeadsMind, ${payload.firstName}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <h1 style="font-size: 24px; font-weight: 800; tracking: tight;">Welcome to LeadsMind</h1>
            <p>Hi ${payload.firstName}, your workspace <strong>${payload.workspaceName}</strong> is ready.</p>
            <p>You can now start managing your contacts, social media, and reputation from one place.</p>
            <div style="margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background: #6c47ff; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('[setupWorkspace] Welcome email failed:', emailErr);
    }

    return { success: true, workspaceId: workspace.id };
  } catch (err) {
    console.error('[setupWorkspace] Unexpected error:', err);
    // Try last-resort recovery
    try {
      const supabase2 = await createServerClient();
      const { data: fallback } = await supabase2
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', payload.userId)
        .limit(1)
        .single();
      if (fallback) return { success: true, workspaceId: fallback.workspace_id };
    } catch {}
    return { success: false, error: 'An unexpected error occurred during workspace setup' };
  }
}

export async function setActiveWorkspace(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set('active_workspace_id', workspaceId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  
  return { success: true };
}

/**
 * Creates the Auth user and sends the branded confirmation email via the app's own Resend path
 * (admin.generateLink()) instead of the client-side supabase.auth.signUp() call this replaces.
 *
 * Two independent reasons for this, not just branding:
 * 1. Email confirmation is mandatory on this project, so signUp() never returns a session
 *    anyway — there's nothing to gain from a client-side call.
 * 2. supabase.auth.signUp() with the browser client's default PKCE flow produces a code=...
 *    confirmation link, which only works from the SAME browser that started the signup (the
 *    PKCE code verifier lives in that browser's storage) — it fails with
 *    AuthPKCECodeVerifierMissingError the moment it's opened elsewhere (a different browser,
 *    device, or the user's mail-client browser). generateLink()'s token_hash is a stateless
 *    OTP, so the confirmation link works from any device/browser.
 */
export async function signUpBasic(payload: { email: string; password: string; fullName: string; next?: string }) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const next = safeInternalPath(payload.next, '/dashboard');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: payload.email,
      password: payload.password,
      options: {
        data: { full_name: payload.fullName },
        redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      if (isDuplicateSignupError(error)) {
        return { success: false, error: 'An account with this email already exists. Try logging in.' };
      }
      console.error('[signUpBasic] generateLink failed:', error.message);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }

    const verificationLink = `${appUrl}/auth/callback?token_hash=${data.properties.hashed_token}&type=signup&next=${encodeURIComponent(next)}`;

    try {
      await sendEmail({
        to: payload.email,
        subject: 'Confirm your LeadsMind account',
        react: createElement(VerificationEmail, { verificationLink }),
      });
    } catch (emailErr) {
      console.error('[signUpBasic] Verification email failed:', emailErr);
      return { success: false, error: 'Account created, but the confirmation email failed to send. Please contact support.' };
    }

    return { success: true, userId: data.user.id };
  } catch (error) {
    console.error('[signUpBasic] Unexpected error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// Always returns the same generic response regardless of whether the email is registered —
// generateLink() errors (e.g. "user not found") differ observably from the success path, so
// branching the response on them would let an attacker enumerate registered emails.
const FORGOT_PASSWORD_GENERIC_RESPONSE: { success: boolean; error?: string } = { success: true };

export async function forgotPassword(email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${appUrl}/auth/callback?next=/reset-password` },
    });

    if (error) {
      console.error('[forgotPassword] generateLink failed:', error.message);
      return FORGOT_PASSWORD_GENERIC_RESPONSE;
    }

    const resetLink = `${appUrl}/auth/callback?token_hash=${data.properties.hashed_token}&type=recovery&next=/reset-password`;

    await sendEmail({
      to: email,
      subject: 'Reset your LeadsMind password',
      react: createElement(PasswordResetEmail, { resetLink }),
    });

    return FORGOT_PASSWORD_GENERIC_RESPONSE;
  } catch (error) {
    console.error('[forgotPassword] Unexpected error:', error);
    return FORGOT_PASSWORD_GENERIC_RESPONSE;
  }
}

export async function resetPassword(password: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Reset password error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function handleLogout() {
  const { logout } = await import('@/lib/auth');
  await logout();
}
