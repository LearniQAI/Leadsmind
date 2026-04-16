import { requireAdmin, getCurrentWorkspaceId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Plus, Info } from 'lucide-react';
import FormBuilder from '@/components/marketing/FormBuilder';
import { Button } from '@/components/ui/button';

export default async function FormsPage() {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
               <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Lead Capture Forms</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            Create high-converting forms to capture leads directly from your website.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Create New Form</h3>
          </div>
          <FormBuilder workspaceId={workspaceId} />
        </section>
      </div>
    </div>
  );
}
