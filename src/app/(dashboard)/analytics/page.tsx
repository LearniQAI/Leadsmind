import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { fetchDashboardMetrics } from '@/lib/analytics';
import { DateRange } from '@/types/analytics.types';
import { KpiCard } from '@/components/analytics/KpiCard';
import { ContactsChart } from '@/components/analytics/ContactsChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { SourceDonut } from '@/components/analytics/SourceDonut';
import { PipelineFunnel } from '@/components/analytics/PipelineFunnel';
import {
  Users,
  DollarSign,
  GitGraph,
  GraduationCap,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const params = await searchParams;
  const range = (['7d', '30d', '90d'].includes(params?.range ?? '') ? params.range : '30d') as DateRange;

  if (!workspaceId) {
    return <div className="text-white/40 p-8">No workspace found.</div>;
  }

  const metrics = await fetchDashboardMetrics(workspaceId, range);

  const rangeOptions: { label: string; value: DateRange }[] = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
  ];

  const statusColor: Record<string, string> = {
    paid: 'border-green-500/20 text-green-400 bg-green-500/10',
    draft: 'border-white/10 text-white/40 bg-white/5',
    sent: 'border-[#6c47ff]/20 text-[#6c47ff] bg-[#6c47ff]/10',
    overdue: 'border-red-500/20 text-red-400 bg-red-500/10',
    cancelled: 'border-white/10 text-white/40 bg-white/5',
    open: 'border-orange-500/20 text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-white/40 text-sm">Business intelligence for your workspace.</p>
        </div>
        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {rangeOptions.map(opt => (
            <Link
              key={opt.value}
              href={`/analytics?range=${opt.value}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === opt.value
                  ? 'bg-[#6c47ff] text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={
            <span className="flex items-center gap-1.5">
              Total Contacts
              <InfoTooltip content="Total number of unique leads and clients in your workspace CRM." />
            </span>
          }
          data={metrics.totalContacts}
          format="integer"
          icon={<Users className="h-5 w-5 text-[#6c47ff]" />}
          iconBg="bg-[#6c47ff]/10"
        />
        <KpiCard
          title={
            <span className="flex items-center gap-1.5">
              Revenue This Period
              <InfoTooltip content="Total value of paid invoices within the selected date range." />
            </span>
          }
          data={metrics.revenueThisPeriod}
          format="currency"
          icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          title={
            <span className="flex items-center gap-1.5">
              Open Pipeline Value
              <InfoTooltip content="Potential revenue from all active opportunities across all stages of your pipelines." />
            </span>
          }
          data={metrics.openPipelineValue}
          format="currency"
          icon={<GitGraph className="h-5 w-5 text-orange-400" />}
          iconBg="bg-orange-500/10"
        />
        <KpiCard
          title={
            <span className="flex items-center gap-1.5">
              Course Enrollments
              <InfoTooltip content="Total number of students currently enrolled across all your LMS courses." />
            </span>
          }
          data={metrics.courseEnrollments}
          format="integer"
          icon={<GraduationCap className="h-5 w-5 text-sky-400" />}
          iconBg="bg-sky-500/10"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContactsChart data={metrics.contactsOverTime} />
        <RevenueChart data={metrics.revenueByWeek} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourceDonut data={metrics.contactsBySource} />
        <PipelineFunnel data={metrics.pipelineFunnel} />
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Contacts */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" />
            Top Active Contacts
          </h3>
          {metrics.topActiveContacts.length === 0 ? (
            <p className="text-xs text-white/20">No contact activity logged yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {metrics.topActiveContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-[10px] text-white/30">{contact.email}</p>
                  </div>
                  <p className="text-[10px] text-white/30">
                    {contact.last_activity_at
                      ? new Date(contact.last_activity_at).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-white/40" />
            Recent Invoices
          </h3>
          {metrics.recentInvoices.length === 0 ? (
            <p className="text-xs text-white/20">No invoices yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {metrics.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-white">{inv.contact_name}</p>
                    <p className="text-[10px] text-white/30">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      ${inv.amount.toLocaleString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`capitalize text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor[inv.status] ?? ''}`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
