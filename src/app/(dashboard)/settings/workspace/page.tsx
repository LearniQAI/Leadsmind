import { requireAdmin, getCurrentWorkspace } from '@/lib/auth';
import { WorkspaceSettingsForm } from '@/components/dashboard/WorkspaceSettingsForm';
import { redirect } from 'next/navigation';

export default async function WorkspaceSettingsPage() {
  // Ensure user is admin of the current workspace
  await requireAdmin();
  
  const workspace = await getCurrentWorkspace();
  
  if (!workspace) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s settings, branding, and billing.
        </p>
      </div>

      <WorkspaceSettingsForm workspace={workspace} />
    </div>
  );
}
