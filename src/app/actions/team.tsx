'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { requireAdmin, getUser, getCurrentWorkspaceId, getCurrentProfile } from '@/lib/auth';
import { inviteSchema, InviteValues } from '@/lib/validations/team.schema';
import { sendEmail } from '@/lib/email';
import InvitationEmail from '@/emails/invitation';
import React from 'react';

/**
 * INVITE MEMBER
 */
export async function inviteMember(payload: InviteValues) {
  await requireAdmin();
  
  const validatedFields = inviteSchema.safeParse(payload);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid fields' };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: 'No active workspace' };

  const supabase = await createServerClient();

  // 1. Check if user is already a member
  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', (await supabase.from('users').select('id').eq('email', validatedFields.data.email).single()).data?.id || '00000000-0000-0000-0000-000000000000')
    .single();

  if (existingMember) {
    return { success: false, error: 'This user is already a member of this workspace' };
  }

  // 2. Check if a pending invitation exists
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', validatedFields.data.email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingInvite) {
    return { success: false, error: 'An invitation has already been sent to this email' };
  }

  // 3. Create invitation
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  const { error: inviteError } = await supabase
    .from('invitations')
    .insert({
      workspace_id: workspaceId,
      email: validatedFields.data.email,
      role: validatedFields.data.role,
      token,
      expires_at: expiresAt,
    });

  if (inviteError) {
    console.error('Error creating invitation:', inviteError);
    return { success: false, error: 'Failed to create invitation' };
  }

  // 4. Get workspace info with branding for email
  const { data: workspace } = await supabase
    .from('workspaces')
    .select(`
      name,
      branding:workspace_branding(platform_name, primary_color)
    `)
    .eq('id', workspaceId)
    .single();

  const user = await getCurrentProfile();
  
  // @ts-ignore
  const branding = workspace?.branding?.[0] || null;

  // 5. Send email
  const inviteUrl = `http://localhost:3000/invite/accept?token=${token}`;
  
  try {
    await sendEmail({
      to: validatedFields.data.email,
      subject: `[${workspace?.name}] You have been invited to join`,
      react: (
        <InvitationEmail
          workspaceName={workspace?.name}
          inviterName={user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Someone'}
          inviteUrl={inviteUrl}
          role={validatedFields.data.role}
          expiresIn="48 hours"
          platformName={branding?.platform_name || 'LeadsMind'}
          primaryColor={branding?.primary_color || '#6c47ff'}
        />
      ),
    });
  } catch (emailError) {
    console.error('Failed to send invitation email:', emailError);
    // We don't return error here because the record is already created, 
    // but the user might need to "Resend" it.
  }

  revalidatePath('/settings/team');
  return { success: true };
}

/**
 * RESEND INVITATION
 */
export async function resendInvitation(invitationId: string) {
  await requireAdmin();
  
  const supabase = await createServerClient();
  const { data: invite, error: fetchError } = await supabase
    .from('invitations')
    .select('*, workspaces(name, branding:workspace_branding(platform_name, primary_color))')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invite) {
    return { success: false, error: 'Invitation not found' };
  }

  const newToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      token: newToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  if (updateError) {
    return { success: false, error: 'Failed to update invitation' };
  }

  const user = await getCurrentProfile();
  const inviteUrl = `http://localhost:3000/invite/accept?token=${newToken}`;
  
  // @ts-ignore
  const branding = invite.workspaces?.branding?.[0] || null;

  try {
    await sendEmail({
      to: invite.email,
      subject: `[${invite.workspaces?.name}] You have been invited to join`,
      react: (
        <InvitationEmail
          workspaceName={invite.workspaces?.name}
          inviterName={user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Someone'}
          inviteUrl={inviteUrl}
          role={invite.role}
          expiresIn="48 hours"
          platformName={branding?.platform_name || 'LeadsMind'}
          primaryColor={branding?.primary_color || '#6c47ff'}
        />
      ),
    });
  } catch (emailError) {
    console.error('Failed to resend invitation email:', emailError);
    return { success: false, error: 'Failed to send email' };
  }

  revalidatePath('/settings/team');
  return { success: true };
}

/**
 * CANCEL INVITATION
 */
export async function cancelInvitation(invitationId: string) {
  await requireAdmin();
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    return { success: false, error: 'Failed to cancel invitation' };
  }

  revalidatePath('/settings/team');
  return { success: true };
}

/**
 * UPDATE ROLE
 */
export async function updateMemberRole(memberId: string, newRole: 'admin' | 'member' | 'client') {
  await requireAdmin();
  const user = await getUser();
  const supabase = await createServerClient();

  // Prevent self-demotion
  const { data: member } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('id', memberId)
    .single();

  if (member?.user_id === user?.id) {
    return { success: false, error: 'You cannot change your own role' };
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', memberId);

  if (error) {
    return { success: false, error: 'Failed to update role' };
  }

  revalidatePath('/settings/team');
  return { success: true };
}

/**
 * REMOVE MEMBER
 */
export async function removeMember(memberId: string) {
  await requireAdmin();
  const user = await getUser();
  const supabase = await createServerClient();

  // Prevent self-removal
  const { data: member } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('id', memberId)
    .single();

  if (member?.user_id === user?.id) {
    return { success: false, error: 'You cannot remove yourself from the workspace' };
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    return { success: false, error: 'Failed to remove member' };
  }

  revalidatePath('/settings/team');
  return { success: true };
}

/**
 * ACCEPT INVITATION
 */
export async function acceptInvitationAction(payload: {
  token: string;
  fullName?: string;
  password?: string;
}) {
  const supabase = await createServerClient();

  // 1. Validate token
  const { data: invite, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', payload.token)
    .single();

  if (inviteError || !invite) {
    return { success: false, error: 'Invalid or expired invitation token' };
  }

  // 2. Check expiry
  if (new Date(invite.expires_at) < new Date() || invite.accepted_at) {
    return {
      success: false,
      error: 'This invitation has expired or already been used. Ask the workspace admin to send a new one.',
    };
  }

  // 3. Check if user already exists
  const { data: { user: existingAuthUser } } = await supabase.auth.getUser();
  
  let userId = existingAuthUser?.id;

  if (!userId) {
    // If no user logged in, check if an account exists for this email
    const { data: existingProfiles } = await supabase
      .from('users')
      .select('id')
      .eq('email', invite.email)
      .single();

    if (existingProfiles) {
      // Account exists but not logged in. Tell them to log in.
      return { 
        success: false, 
        error: 'An account already exists for this email. Please log in first, then click the invitation link again.',
        requiresLogin: true 
      };
    }

    // No account exists, so we must be in the "mini signup" flow
    if (!payload.fullName || !payload.password) {
      return { success: false, error: 'Full name and password are required for signup' };
    }

    // Create auth user
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: invite.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
        },
      },
    });

    if (signupError) {
      console.error('Signup error during invitation acceptance:', signupError);
      return { success: false, error: signupError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    userId = authData.user.id;

    // Create public.users record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: invite.email,
        first_name: payload.fullName.split(' ')[0],
        last_name: payload.fullName.split(' ').slice(1).join(' '),
      });

    if (userError) {
      console.error('Error creating user profile during invitation acceptance:', userError);
      return { success: false, error: 'Failed to create user profile' };
    }
  } else {
    // User is logged in. Verify it's the right email.
    if (existingAuthUser?.email !== invite.email) {
      return { 
        success: false, 
        error: `This invitation was sent to ${invite.email}, but you are logged in as ${existingAuthUser?.email}. Please log out and use the correct account.` 
      };
    }
  }

  // 4. Add to workspace_members
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: userId,
      role: invite.role,
    });

  if (memberError) {
    if (memberError.code === '23505') {
       // Already a member, that's fine, just update invitation
    } else {
      console.error('Error adding member during invitation acceptance:', memberError);
      return { success: false, error: 'Failed to join workspace' };
    }
  }

  // 5. Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  // 6. Set active workspace cookie
  (await cookies()).set('active_workspace_id', invite.workspace_id as string, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  revalidatePath('/', 'layout');
  return { success: true, workspaceId: invite.workspace_id };
}
