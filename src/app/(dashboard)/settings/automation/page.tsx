import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireAdmin, getCurrentWorkspaceId } from '@/lib/auth';
import { AutomationSettingsForm } from '@/components/dashboard/AutomationSettingsForm';
import { AutomationStatsOverview } from '@/components/dashboard/AutomationStatsOverview';
import { getAutomationStats } from '@/app/actions/automation';
import { Shield, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AutomationSettingsPage() {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const supabase = await createServerClient();
  
  // Fetch workspace and stats in parallel for performance
  const [workspaceResponse, stats] = await Promise.all([
    supabase.from('workspaces').select('*').eq('id', workspaceId).single(),
    getAutomationStats(workspaceId)
  ]);

  const workspace = workspaceResponse.data;

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Info className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Workspace not found</h2>
        </div>
      </div>
    );
  }

  const initialValues = {
    resend_api_key: workspace.resend_api_key || '',
    email_from_name: workspace.email_from_name || 'Leadsmind Sales',
    email_from_address: workspace.email_from_address || 'noreply@yourdomain.com',
    twilio_sid: workspace.twilio_sid || '',
    twilio_token: workspace.twilio_token || '',
    twilio_number: workspace.twilio_number || '',
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header section - responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
               <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Automation Infrastructure</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            Manage your communication keys (Resend, Twilio) and integrate your website with the Leadsmind engine.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Button asChild variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 text-primary">
            <a href="/automations">
              <Zap className="mr-2 h-4 w-4" />
              Manage Workflows
            </a>
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 w-fit bg-primary/5 rounded-full border border-primary/10">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Admin Access Only</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:gap-8">
        {/* Statistics Overview */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Live Status</h3>
          <AutomationStatsOverview stats={stats} />
        </section>

        {/* Configuration Forms */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Infrastructure Settings</h3>
          <AutomationSettingsForm initialValues={initialValues} />
        </section>

        {/* Lead Capture Integration */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Website Lead Capture</h3>
          <div className="p-6 rounded-3xl border border-white/5 bg-[#050510]/50 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">How to connect your website</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    To capture leads from your website and trigger automations, send a POST request to the endpoint below.
                    Once a lead is captured, it will automatically trigger any active workflow with a "Contact Created" trigger.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase text-white/30">Your Webhook Endpoint</div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[11px] text-blue-400 break-all select-all">
                  {`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/leads`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase text-white/30">Required JSON Payload</div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[11px] text-emerald-400">
{`{
  "workspaceId": "${workspaceId}",
  "email": "lead@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}`}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
