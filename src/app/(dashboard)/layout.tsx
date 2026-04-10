import { requireAuth, getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to /login if not authenticated
  const authUser = await requireAuth();

  // Fetch profile and workspace — both are resilient (return null on failure)
  const [profile, workspace] = await Promise.all([
    getCurrentProfile(),
    getCurrentWorkspace(),
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
    <DashboardShell user={user} workspace={workspaceData}>
      {children}
    </DashboardShell>
  );
}
