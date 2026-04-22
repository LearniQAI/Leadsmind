'use client';

import { 
  Users, 
  TrendingUp, 
  Send, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DashboardClientProps {
  stats: {
    contacts: number;
    opportunities: number;
    revenue: number;
    socialQueue: number;
  };
  recentActivities: any[];
}

export function DashboardClient({ stats, recentActivities }: DashboardClientProps) {
  const kpiItems = [
    { label: 'Total Leads', value: stats.contacts, icon: Users, trend: '+5%', status: 'up' },
    { label: 'Opportunities', value: stats.opportunities, icon: Target, trend: '+2%', status: 'up' },
    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, trend: '-1%', status: 'down' },
    { label: 'Social Queue', value: stats.socialQueue, icon: Send, trend: 'Active', status: 'neutral' },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-white/40">Welcome back. Here is what is happening across your workspace today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="bg-white/5 border-white/5 text-white/60 hover:bg-white/10 rounded-xl h-11 px-6 font-bold" asChild>
              <Link href="/analytics">View Full Stats</Link>
           </Button>
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-[#6c47ff]/20" asChild>
              <Link href="/contacts/new">Add New Lead</Link>
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((kpi, i) => (
          <Card key={i} className="bg-[#0b0b10] border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all border shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#6c47ff] group-hover:scale-110 transition-transform">
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                  kpi.status === 'up' ? "bg-emerald-500/10 text-emerald-500" : 
                  kpi.status === 'down' ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40"
                )}>
                  {kpi.status === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
                  {kpi.status === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="text-3xl font-bold text-white tracking-tighter">{kpi.value}</div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Activity Feed */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#6c47ff]" /> Recent Activity
            </h3>
            <Button variant="ghost" className="text-xs font-bold text-[#6c47ff] hover:bg-white/5">
              Clear History
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">No recent activity reported</p>
              </div>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-[#0b0b10] border border-white/5 hover:border-white/10 transition-all">
                   <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {activity.type === 'email' ? <Send className="h-4 w-4 text-[#6c47ff]" /> :
                       activity.type === 'system' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                       <AlertCircle className="h-4 w-4 text-amber-500" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-medium">{activity.description}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                   </div>
                   <Button variant="ghost" size="icon" className="text-white/10 hover:text-white h-8 w-8">
                      <ArrowUpRight className="h-4 w-4" />
                   </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="col-span-4 space-y-8">
           <Card className="bg-white/[0.02] border-white/5 rounded-3xl overflow-hidden shadow-none">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold text-white/30 uppercase tracking-widest">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                 {[
                   { label: 'Compose Email', href: '/campaigns/new', icon: Send },
                   { label: 'Schedule Social Post', href: '/social', icon: TrendingUp },
                   { label: 'Create New Pipeline', href: '/pipelines', icon: Target },
                   { label: 'Add User to Team', href: '/team-members', icon: Users },
                 ].map((action, i) => (
                   <Button key={i} variant="outline" className="w-full justify-start h-12 bg-white/5 border-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold gap-3 rounded-xl transition-all" asChild>
                      <Link href={action.href}>
                         <action.icon className="h-4 w-4 text-[#6c47ff]" />
                         {action.label}
                      </Link>
                   </Button>
                 ))}
              </CardContent>
           </Card>

           <div className="p-8 rounded-3xl bg-linear-to-br from-[#6c11ff]/20 to-transparent border border-[#6c47ff]/10">
              <Sparkles className="h-8 w-8 text-[#6c47ff] mb-4" />
              <h4 className="text-lg font-bold text-white leading-tight mb-2">Automate your growth with AI workflows.</h4>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                Connect your email and social accounts to let our automation engine handle your outreach while you sleep.
              </p>
              <Button className="w-full bg-[#6c47ff] hover:bg-[#8b5cf6] text-white font-bold text-xs uppercase tracking-widest rounded-xl h-11" asChild>
                 <Link href="/automations">Configure Autopilot</Link>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
)
