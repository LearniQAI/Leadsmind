import { getCurrentProfile, getCurrentWorkspace, getUserRole } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { WorkspaceSync } from '@/components/auth/WorkspaceSync';
import { redirect } from 'next/navigation';
import React from 'react';
import { fetchBranding } from '@/lib/branding';
import { BrandingProvider } from '@/components/branding/BrandingProvider';

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

  const [profile, workspace, role] = await Promise.all([
    getCurrentProfile(authUser),
    getCurrentWorkspace(authUser),
    getUserRole(),
  ]);

  const branding = workspace ? await fetchBranding(workspace.id) : null;

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
        plan: workspace.plan,
      }
    : null;

  return (
    <>
      <WorkspaceSync workspaceId={workspaceData?.id ?? null} />
      <BrandingProvider primaryColor={branding?.primary_color}>
        <DashboardShell 
          user={user} 
          workspace={workspaceData}
          role={role}
          branding={{
            platformName: branding?.platform_name,
            logoUrl: branding?.logo_url,
          }}
        >
          {children}
        </DashboardShell>
      </BrandingProvider>
    </>
  );
}
