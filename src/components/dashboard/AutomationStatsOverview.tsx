'use client';

import { 
  History, 
  Hourglass, 
  AlertCircle, 
  Workflow, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AutomationStats {
  pausedCount: number;
  totalRecent: number;
  failureCount: number;
  workflowCount: number;
  successRate: number;
}

interface AutomationStatsOverviewProps {
  stats: AutomationStats;
}

export function AutomationStatsOverview({ stats }: AutomationStatsOverviewProps) {
  const items = [
    {
      label: 'Waiting (Delays)',
      value: stats.pausedCount,
      icon: Hourglass,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Active contacts in delay steps'
    },
    {
      label: 'Processed (24h)',
      value: stats.totalRecent,
      icon: History,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Tasks executed in the last day'
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: stats.successRate > 90 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: stats.successRate > 90 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      description: 'Percentage of healthy executions'
    },
    {
      label: 'Workflows',
      value: stats.workflowCount,
      icon: Workflow,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Total active automations'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <Card key={i} className="group border border-white/5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.4)] bg-[#0c0c16]/50 backdrop-blur-xl rounded-[28px] overflow-hidden transition-all hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] hover:bg-[#0c0c16]/80 hover:-translate-y-1">
          <CardContent className="p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <item.icon size={100} />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className={cn(
                "p-3 rounded-2xl border border-white/5 shadow-inner transition-transform group-hover:scale-110",
                item.bgColor, 
                item.color
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              {item.label === 'Waiting (Delays)' && stats.pausedCount > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Live</span>
                </div>
              )}
            </div>
            
            <div className="relative z-10">
              <div className="text-3xl font-black text-white tracking-tight mb-1.5">
                {item.value}
              </div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">
                {item.label}
              </div>
              <p className="text-[9px] text-white/20 mt-3 font-medium leading-relaxed italic">
                {item.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
