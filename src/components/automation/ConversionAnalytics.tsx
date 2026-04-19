"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertCircle, 
  ArrowDownRight,
  Target,
  RefreshCcw,
  Minus
} from "lucide-react";
import { getWorkflowAnalytics, getWorkflowRevenue } from "@/app/actions/automation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionAnalyticsProps {
  workflowId: string;
}

export function ConversionAnalytics({ workflowId }: ConversionAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, revenueData] = await Promise.all([
        getWorkflowAnalytics(workflowId),
        getWorkflowRevenue(workflowId)
      ]);
      setStats(analyticsData);
      setRevenue(revenueData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workflowId]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" />
      </div>
    );
  }

  const totalEnrollments = revenue?.total_enrollments || 0;
  const totalRevenue = revenue?.total_revenue || 0;
  const avgRevenue = revenue?.revenue_per_enrollment || 0;
  
  // Calculate completion rate based on first and last step
  const completionRate = stats.length > 0 
    ? Math.round((stats[stats.length - 1].completed_count / (stats[0].reached_count || 1)) * 100)
    : 0;

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Conversion Funnel
          </h2>
          <p className="text-sm text-white/40">Real-time performance and ROI tracking</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
        >
          <RefreshCcw className="w-3.5 h-3.5 mr-2" />
          Refresh
        </Button>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0f0f1a] border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-12 h-12" />
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Total Enrollments</p>
          <h3 className="text-2xl font-black text-white">{totalEnrollments.toLocaleString()}</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last wk</span>
          </div>
        </Card>

        <Card className="bg-[#0f0f1a] border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-12 h-12" />
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Completion Rate</p>
          <h3 className="text-2xl font-black text-white">{completionRate}%</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-bold">
            <Minus className="w-3 h-3" />
            <span>Benchmark: 15%</span>
          </div>
        </Card>

        <Card className="bg-[#0f0f1a] border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-12 h-12" />
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</h3>
          <p className="mt-2 text-[10px] text-white/40 font-medium">Attributed to workflow</p>
        </Card>

        <Card className="bg-[#0f0f1a] border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Avg Value / Contact</p>
          <h3 className="text-2xl font-black text-white">${Math.round(avgRevenue)}</h3>
          <p className="mt-2 text-[10px] text-white/40 font-medium font-mono uppercase">ROI Efficiency</p>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4">
        {stats.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
            <AlertCircle className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-sm text-white/30">No execution data available for this funnel yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((step, idx) => {
              const isProblematic = step.drop_off_percentage > 50;
              const isWarning = step.drop_off_percentage > 30;
              
              return (
                <div key={step.step_id} className="relative group">
                  {/* Connect Line */}
                  {idx < stats.length - 1 && (
                    <div className="absolute left-[34px] top-14 bottom-[-16px] w-0.5 bg-gradient-to-b from-white/10 to-transparent z-0" />
                  )}
                  
                  <div className="flex items-center gap-6 relative z-10">
                    {/* Index Circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border transition-all duration-500",
                      isProblematic ? "bg-rose-500/20 border-rose-500/30 text-rose-500" :
                      isWarning ? "bg-amber-500/20 border-amber-500/30 text-amber-500" :
                      "bg-white/5 border-white/10 text-white/40"
                    )}>
                      {idx + 1}
                    </div>

                    {/* Step Card */}
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/[0.07] transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter mb-0.5">
                          {step.step_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-white/80">{step.label || `Step ${idx+1}`}</span>
                      </div>

                      <div className="flex items-center gap-12">
                        {/* Metrics */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-white/30 uppercase">Reached</p>
                          <p className="text-sm font-black text-white">{step.reached_count}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold text-white/30 uppercase">Completed</p>
                          <p className="text-sm font-black text-white/90">{step.completed_count}</p>
                        </div>

                        {/* Drop off indicator */}
                        <div className="w-24 text-right">
                          <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Drop-off</p>
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={cn(
                              "text-xs font-black",
                              isProblematic ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
                            )}>
                              {Math.round(step.drop_off_percentage)}%
                            </span>
                            {step.drop_off_percentage > 0 && (
                              <ArrowDownRight className={cn(
                                "w-3 h-3",
                                isProblematic ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
                              )} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
