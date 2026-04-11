import { requireAuth, getUserRole, getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDashboardMetrics } from '@/app/actions/dashboard';
import {
  Users,
  Handshake,
  Mail,
  Plus,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // requireAuth redirects to /login if not authenticated
  const user = await requireAuth();

  // Fetch data in parallel for performance — all are resilient (return null on failure)
  const [profile, workspace, role, metrics] = await Promise.all([
    getCurrentProfile(),
    getCurrentWorkspace(),
    getUserRole(),
    getDashboardMetrics(),
  ]);

  // Determine display name with multiple fallbacks
  const firstName =
    profile?.firstName ||
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there';

  const stats = [
    {
      name: 'Total Contacts',
      value: metrics?.totalContacts?.toLocaleString() ?? '0',
      icon: Users,
      description: 'Active in CRM',
      trend: '+0 this week',
      color: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-400',
    },
    {
      name: 'Open Deals',
      value: metrics?.openDeals?.toLocaleString() ?? '0',
      icon: Handshake,
      description: 'Active opportunities',
      trend: 'In pipeline',
      color: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-purple-400',
    },
    {
      name: 'Revenue Won',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(metrics?.wonValue ?? 0),
      icon: TrendingUp,
      description: 'Closed deals value',
      trend: 'All time',
      color: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-400',
    },
    {
      name: 'Conversations',
      value: metrics?.activeConversations?.toLocaleString() ?? '0',
      icon: Mail,
      description: `${metrics?.connectedPlatforms ?? 0} platform${(metrics?.connectedPlatforms ?? 0) !== 1 ? 's' : ''} connected`,
      trend: 'All channels',
      color: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {workspace ? 'Workspace Online' : 'Getting Started'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#6c47ff] to-[#8b5cf6]">
              {firstName}
            </span>
          </h1>
          <p className="text-base font-light text-white/40">
            {workspace ? (
              <>
                Managing{' '}
                <span className="font-semibold text-white/70">{workspace.name}</span>
                {role && (
                  <>
                    {' '}·{' '}
                    <span className="text-[#6c47ff] font-semibold capitalize">{role}</span>
                  </>
                )}
              </>
            ) : (
              'Your workspace is being set up. Refresh in a moment if data is missing.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="h-11 rounded-xl bg-[#6c47ff] px-5 font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            asChild
          >
            <Link href="/contacts/new">
              <Plus className="h-4 w-4" />
              New Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Announcement / CRM Hero ─── */}
      <Card className="relative overflow-hidden border-white/5 bg-linear-to-br from-[#6c47ff]/10 via-white/2 to-transparent animate-fade-up [animation-delay:80ms]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#6c47ff]/15 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <Badge className="bg-[#6c47ff]/20 text-[#6c47ff] border border-[#6c47ff]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Phase 2 Live
              </Badge>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                CRM &amp; Pipelines are active
              </h2>
              <p className="text-base font-light text-white/50 leading-relaxed">
                Manage contacts, track deals, and pipeline your way to growth — all connected to real Supabase data.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-xl border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10 gap-2"
                >
                  <Link href="/contacts">
                    <Users className="h-4 w-4" />
                    Contacts
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-xl border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10 gap-2"
                >
                  <Link href="/pipelines">
                    <Target className="h-4 w-4" />
                    Pipelines
                  </Link>
                </Button>
              </div>
            </div>
            <div className="shrink-0 opacity-10 hidden md:block">
              <Sparkles className="h-32 w-32 text-[#6c47ff]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Stats Grid ─── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up [animation-delay:160ms]">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className={`group relative overflow-hidden border-white/5 bg-linear-to-br ${stat.color} transition-all hover:shadow-xl hover:shadow-black/20 hover:border-white/10`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{stat.name}</span>
              <div className={`h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center ${stat.iconColor}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</div>
              <p className="text-[11px] font-semibold text-[#6c47ff] mb-1">{stat.trend}</p>
              <p className="text-[11px] font-medium text-white/20">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Activity + Tips ─── */}
      <div className="grid gap-6 lg:grid-cols-3 animate-fade-up [animation-delay:240ms]">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-white/5 bg-white/1">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white/90">Recent CRM Activity</CardTitle>
                <CardDescription className="text-xs font-light text-white/30 mt-0.5">
                  Latest updates from your contacts and deals
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-[#6c47ff] text-xs font-bold gap-1 hover:bg-[#6c47ff]/10">
                <Link href="/contacts">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {!metrics || metrics.recentActivities.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-white/3 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-white/10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white/20">No activity yet</p>
                  <p className="text-xs text-white/10">Add your first contact to get started</p>
                </div>
                <Button asChild size="sm" className="mt-2 bg-[#6c47ff]/20 text-[#6c47ff] hover:bg-[#6c47ff]/30 rounded-xl font-bold gap-1.5">
                  <Link href="/contacts/new">
                    <Plus className="h-3.5 w-3.5" />
                    Add Contact
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.recentActivities.map((activity) => {
                  const contact = activity.contacts as { first_name?: string; last_name?: string } | undefined;
                  const initials = `${contact?.first_name?.[0] ?? '?'}${contact?.last_name?.[0] ?? ''}`;
                  const fullName = contact
                    ? `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim()
                    : 'Unknown';

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#6c47ff]/15 flex items-center justify-center text-[#6c47ff] font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white truncate">{fullName}</span>
                          <span className="text-xs text-white/40 truncate">{activity.description}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 shrink-0 ml-4">
                        {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-white/5 bg-white/[0.01]">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-lg font-bold text-white/90">Quick Tips</CardTitle>
            <CardDescription className="text-xs font-light text-white/30 mt-0.5">
              Master your CRM workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-5">
              {[
                {
                  title: 'Tag your leads',
                  desc: 'Use tags to group leads and filter them quickly',
                  icon: '🏷️',
                },
                {
                  title: 'Log interactions',
                  desc: 'Add notes and tasks to keep a full contact history',
                  icon: '📝',
                },
                {
                  title: 'Move your deals',
                  desc: 'Drag and drop opportunities through your pipeline',
                  icon: '🎯',
                },
                {
                  title: 'Phase 3: Campaigns',
                  desc: 'Automated email sequences coming soon',
                  icon: '📧',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="text-lg shrink-0 mt-0.5">{item.icon}</div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs font-light text-white/25 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
