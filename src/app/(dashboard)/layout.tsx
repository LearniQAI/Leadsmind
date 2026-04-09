import { requireAuth, getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  await requireAuth();
  
  // Fetch profile and workspace data
  const user = await getCurrentProfile();
  const workspace = await getCurrentWorkspace();

  return (
    <DashboardShell user={user} workspace={workspace}>
      {children}
    </DashboardShell>
  );
}
