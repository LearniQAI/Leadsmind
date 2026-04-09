import { requireAuth, getUserRole, getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDashboardMetrics } from '@/app/actions/dashboard';
import { 
  Users, 
  Handshake, 
  Mail, 
  BookOpen, 
  Plus,
  Sparkles,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  const workspace = await getCurrentWorkspace();
  const role = await getUserRole();
  const metrics = await getDashboardMetrics();

  const firstName = profile?.firstName || user.email?.split('@')[0] || 'User';

  const stats = [
    { 
      name: 'Total Contacts', 
      value: metrics?.totalContacts.toString() || '0', 
      icon: Users, 
      description: 'Active in CRM', 
      trend: 'Real-time data' 
    },
    { 
      name: 'Open Deals', 
      value: metrics?.openDeals.toString() || '0', 
      icon: Handshake, 
      description: 'Active opportunities', 
      trend: 'Sales Pipeline' 
    },
    { 
      name: 'Closed Value', 
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(metrics?.wonValue || 0), 
      icon: Sparkles, 
      description: 'Revenue won', 
      trend: 'Success' 
    },
    { 
      name: 'Campaigns', 
      value: '0', 
      icon: Mail, 
      description: 'Emails sent', 
      trend: 'Phase 3 Coming soon' 
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#6c47ff] animate-pulse" />
            <span className="text-[10px] font-bold text-[#6c47ff] uppercase tracking-widest">Workspace Online</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/40">{firstName}</span>
          </h1>
          <p className="text-lg font-light text-white/40">
            You are managing <span className="font-semibold text-white/80">{workspace?.name || 'LeadsMind'}</span> as a <span className="text-[#6c47ff] font-semibold">{role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 rounded-xl bg-[#6c47ff] px-6 font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:scale-[1.02] active:scale-[0.98]" size="lg" asChild>
            <Link href="/contacts/new">
                <Plus className="mr-2 h-4 w-4" />
                New Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Announcement Card */}
      <Card className="relative overflow-hidden border-white/5 bg-white/[0.03] p-8 md:p-12 animate-fade-up [animation-delay:100ms] group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] transition-opacity group-hover:opacity-[0.05] pointer-events-none">
          <Sparkles className="h-64 w-64 text-white" />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-[#6c47ff]/5 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Phase 2 Live
            </Badge>
            <h2 className="text-3xl font-bold text-white tracking-tight">CRM & Pipelines are now active</h2>
            <p className="text-lg font-light text-white/50 leading-relaxed">
              Start managing your relationships and sales pipelines with real-time data. 
              The foundation for your business growth is ready.
            </p>
            <div className="flex gap-4 pt-2">
              <Button asChild variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10">
                <Link href="/contacts">
                  Manage Contacts
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10">
                <Link href="/pipelines">
                  Visualize Pipelines
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up [animation-delay:200ms]">
        {stats.map((stat) => (
          <Card key={stat.name} className="group relative overflow-hidden border-white/5 bg-white/[0.02] shadow-sm transition-all hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="h-16 w-16 text-white" />
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest leading-none">
                {stat.name}
              </span>
              <stat.icon className="h-4 w-4 text-white/30 group-hover:text-[#6c47ff] transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white tracking-tight mb-1">{stat.value}</div>
              <p className="text-xs font-semibold text-[#6c47ff] mb-4">
                {stat.trend}
              </p>
              <p className="text-[11px] font-medium text-white/20">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Content Section */}
      <div className="grid gap-8 lg:grid-cols-3 animate-fade-up [animation-delay:300ms]">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white/90">Recent CRM Activity</CardTitle>
            <CardDescription className="text-sm font-light text-white/30">Latest updates from your contacts and deals</CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            {metrics?.recentActivities.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-4">
                    <Clock className="h-8 w-8 text-white/5" />
                    <p className="text-sm font-medium text-white/20">No recent activity found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {metrics?.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-[#6c47ff]/10 flex items-center justify-center text-[#6c47ff] font-bold text-xs">
                                    {(activity.contacts as any)?.first_name?.[0]}{(activity.contacts as any)?.last_name?.[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">
                                        {(activity.contacts as any)?.first_name} {(activity.contacts as any)?.last_name}
                                    </span>
                                    <span className="text-xs text-white/40">{activity.description}</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                                {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                            </span>
                        </div>
                    ))}
                    <div className="text-center pt-2">
                        <Button variant="link" className="text-[#6c47ff] text-xs font-bold uppercase tracking-widest" asChild>
                            <Link href="/contacts">View All Contacts</Link>
                        </Button>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-white/5 bg-white/[0.01]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/90">Quick Tips</CardTitle>
            <CardDescription className="text-sm font-light text-white/30">Master your CRM workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: "Personalize Tags", desc: "Use tags to group your leads and filter them easily" },
                { title: "Log Every Interaction", desc: "Keep a full history by adding notes and tasks" },
                { title: "Move Your Deals", desc: "Drag and drop opportunities through your pipeline" },
                { title: "Phase 3: Campaigns", desc: "Automated email sequences coming in late April" }
              ].map((item, i) => (
                <div key={i} className="group relative flex items-start gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white/40 group-hover:bg-[#6c47ff]/20 group-hover:text-[#6c47ff]">
                    {i + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs font-light text-white/20">
                      {item.desc}
                    </p>
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

