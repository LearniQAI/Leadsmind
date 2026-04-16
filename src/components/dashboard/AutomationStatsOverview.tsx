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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item, i) => (
        <Card key={i} className="border-none shadow-lg bg-background/50 backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-xl">
          <CardContent className="p-5 md:p-6 italic">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${item.bgColor} ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              {item.label === 'Waiting (Delays)' && stats.pausedCount > 0 && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-none animate-pulse">
                  Live
                </Badge>
              )}
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">
                {item.label}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2 line-clamp-1">
                {item.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
