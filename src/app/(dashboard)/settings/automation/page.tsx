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
    webhook_secret: workspace.webhook_secret || '',
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

        {/* Website Integration - Premium Script Generator */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Website Integration</h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">MATCHES HUBSPOT & GHL</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-white/5 bg-[#050510]/50 backdrop-blur-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Leadsmind Smart Tracker</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Paste this script into your website&apos;s <code className="text-primary">&lt;head&gt;</code> tag. 
                    It will automatically identify visitors and sync them with your CRM.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase text-white/30">Your Tracking Script</div>
                  <button className="text-[10px] font-bold text-primary hover:underline">Copy Script</button>
                </div>
                <div className="p-4 bg-black/60 border border-white/10 rounded-2xl font-mono text-[11px] text-blue-300 break-all select-all leading-relaxed relative group">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tracker.js" 
  data-workspace-id="${workspaceId}" 
  async defer>
</script>`}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-white/60">Currently monitoring active domains: 0</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 bg-[#050510]/50 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Secure Webhook Integration</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      For custom forms (Elementor, Webflow, Shopify), send a POST request with your <span className="text-primary font-bold">Webhook Secret</span> in the header.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-white/30 mb-1">API Endpoint</div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-emerald-400 break-all leading-relaxed">
                      {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/leads`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-white/30 mb-1">Required Header</div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-blue-400 leading-relaxed">
                      Authorization: Bearer [Your_Secret]
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full mt-6 text-[11px] font-bold border border-white/10 hover:bg-white/15 rounded-xl h-12">
                Detailed API Docs
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
