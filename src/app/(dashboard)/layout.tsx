import { getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { WorkspaceSync } from '@/components/auth/WorkspaceSync';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Parallelize Auth, Profile, and Workspace fetching to eliminate waterfalls
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');
  const authUser = session.user;

  const [profile, workspace] = await Promise.all([
    getCurrentProfile(authUser),
    getCurrentWorkspace(authUser),
  ]);

  // Build normalized user object for DashboardShell
  const user = {
    id: authUser.id,
    email: authUser.email,
    firstName: profile?.firstName || authUser.user_metadata?.full_name?.split(' ')[0] || authUser.email?.split('@')[0] || 'User',
    avatarUrl: profile?.avatarUrl ?? null,
  };

  // Build normalized workspace object
  const workspaceData = workspace
    ? {
        id: workspace.id,
        name: workspace.name,
        logoUrl: workspace.logoUrl ?? null,
      }
    : null;

  return (
    <>
      <WorkspaceSync workspaceId={workspaceData?.id ?? null} />
      <DashboardShell user={user} workspace={workspaceData}>
        {children}
      </DashboardShell>
    </>
  );
}
