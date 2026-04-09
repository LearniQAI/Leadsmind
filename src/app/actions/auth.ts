'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

export async function setupWorkspace(payload: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  workspaceName: string;
}) {
  const supabase = await createServerClient();

  try {
    // 1. Create user record in our tracking table (syncing with auth.user)
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: payload.userId,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      return { success: false, error: 'Failed to create user profile' };
    }

    // 2. Create the workspace record
    const slug = `${slugify(payload.workspaceName)}-${Math.random().toString(36).substring(2, 7)}`;
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: payload.workspaceName,
        slug,
        owner_id: payload.userId,
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      return { success: false, error: 'Failed to create workspace' };
    }

    // 3. Create the workspace member record (role: admin)
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: payload.userId,
        role: 'admin',
      });

    if (memberError) {
      console.error('Error creating workspace member:', memberError);
      return { success: false, error: 'Failed to add owner to workspace' };
    }

    revalidatePath('/', 'layout');
    return { success: true, workspaceId: workspace.id };
  } catch (err) {
    console.error('Setup workspace exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function setActiveWorkspace(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set('active_workspace_id', workspaceId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  revalidatePath('/', 'layout')
}

export async function forgotPassword(email: string) {
  const supabase = await createServerClient()
  const appUrl = 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  })

  if (error) {
    console.error('Forgot password error:', error.message)
    // We return success true anyway for production to prevent email enumeration (Rule 7.6)
    // but in local dev we might want to know if it's a real failure
    if (process.env.NODE_ENV === 'development') {
       return { success: false, error: error.message }
    }
    return { success: true }
  }

  return { success: true }
}

export async function resetPassword(password: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    console.error('Reset password error:', error.message)
    return { success: false, error: error.message }
  }

  // After successful reset, clear any session-related data if needed 
  // though Supabase usually signs the user in automatically after a reset
  
  return { success: true }
}

export async function handleLogout() {
  const { logout } = await import('@/lib/auth')
  await logout()
}
