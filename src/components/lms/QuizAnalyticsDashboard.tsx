'use client';

import React, { useMemo } from 'react';
import { 
  Target, 
  Users, 
  Clock, 
  Search, 
  Download, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  BarChart4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function QuizAnalyticsDashboard({ quizId, submissions = [], questions = [] }: any) {
  // 1. Core Metrics Calculation
  const stats = useMemo(() => {
    if (!submissions.length) return null;
    
    const passed = submissions.filter((s: any) => s.status === 'passed').length;
    const avgScore = submissions.reduce((a: any, b: any) => a + (b.score || 0), 0) / submissions.length;
    
    // Distribution Calculations
    const distribution = Array(10).fill(0);
    submissions.forEach((s: any) => {
       const band = Math.min(Math.floor((s.score || 0) / 10), 9);
       distribution[band]++;
    });

    return {
       total: submissions.length,
       passRate: (passed / submissions.length) * 100,
       avgScore,
       distribution
    };
  }, [submissions]);

  if (!stats) {
     return (
        <div className="h-96 flex flex-col items-center justify-center text-center opacity-20">
           <BarChart4 className="h-16 w-16 mb-4" />
           <p className="text-xl font-black uppercase italic tracking-widest">No Intelligence Data Collected</p>
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
       {/* High-Level Pulse */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
             icon={Users} 
             label="Total Engagements" 
             value={stats.total} 
             sub="Complete attempts" 
          />
          <MetricCard 
             icon={Target} 
             label="Pass Velocity" 
             value={`${stats.passRate.toFixed(1)}%`} 
             sub="Success threshold met" 
             color="emerald"
          />
          <MetricCard 
             icon={TrendingUp} 
             label="Average Mastery" 
             value={`${stats.avgScore.toFixed(0)}%`} 
             sub="Overall score mean" 
             color="#6c47ff"
          />
          <MetricCard 
             icon={Clock} 
             label="Time to Success" 
             value="12m 4s" 
             sub="Average session duration" 
             color="amber"
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Distribution */}
          <div className="lg:col-span-2 bg-[#0b0b14] border border-white/5 rounded-[40px] p-10 font-black relative overflow-hidden">
             <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                   <h3 className="text-xl italic uppercase tracking-tighter text-white">Score Distribution</h3>
                   <p className="text-[10px] text-white/20 uppercase tracking-widest">Global student performance bands</p>
                </div>
                <Badge className="bg-white/5 border-white/10 text-white/40">10% Intervals</Badge>
             </div>
             
             <div className="h-64 flex items-end gap-3 px-4">
                {stats.distribution.map((count, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="text-[10px] text-white/10 opacity-0 group-hover:opacity-100 transition-opacity">{count}</div>
                      <div 
                         className="w-full bg-[#6c47ff]/20 border border-[#6c47ff]/30 rounded-t-xl transition-all duration-700 hover:bg-[#6c47ff] group-hover:shadow-[0_0_30px_rgba(108,71,255,0.3)]"
                         style={{ height: `${Math.max((count / stats.total) * 100, 4)}%` }}
                      />
                      <div className="text-[8px] text-white/20 font-bold uppercase">{i*10}%</div>
                   </div>
                ))}
             </div>
          </div>

          {/* Hardest Questions */}
          <div className="lg:col-span-1 bg-[#0b0b14] border border-white/5 rounded-[40px] p-10 space-y-8">
             <div className="space-y-1">
                <h3 className="text-xl italic uppercase tracking-tighter text-white">Critical Points</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-widest">Hardest vs Easiest concepts</p>
             </div>

             <div className="space-y-6">
                <SpotlightItem 
                   label="MOST MISSED" 
                   value="Scalability Protocols" 
                   rate="24% Correct" 
                   variant="remedial" 
                />
                <SpotlightItem 
                   label="EASIEST CONCEPT" 
                   value="Authentication Basics" 
                   rate="98% Correct" 
                   variant="advanced" 
                />
             </div>

             <Button variant="outline" className="w-full h-14 bg-white/5 border-white/10 text-white rounded-2xl gap-2 font-black italic uppercase text-xs">
                View Full Breakdown
                <ArrowRight className="h-4 w-4" />
             </Button>
          </div>
       </div>

       {/* Results Table Section */}
       <div className="bg-[#0b0b14] border border-white/5 rounded-[40px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                   <Target className="h-5 w-5 text-[#6c47ff]" />
                </div>
                <div>
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Student Audit Trail</h3>
                   <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Real-time individual performance logs</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                   <input className="h-10 w-64 bg-white/5 border-white/5 rounded-xl pl-10 text-xs font-bold text-white placeholder:text-white/10" placeholder="Filter by student..." />
                </div>
                <Button className="h-10 px-6 rounded-xl bg-white text-black font-black italic uppercase text-[10px] gap-2">
                   <Download className="h-3.5 w-3.5" />
                   Export CSV
                </Button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-white/[0.005]">
                   <tr>
                      <TableHead>Student Identity</TableHead>
                      <TableHead>Final Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Date Issued</TableHead>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {submissions.map((sub: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-white/[0.01] transition-colors cursor-pointer">
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center font-black italic text-[#6c47ff]">
                                  {sub.contact?.full_name?.charAt(0) || 'S'}
                               </div>
                               <span className="font-bold text-white/80 group-hover:text-white">{sub.contact?.full_name || 'Generic Student'}</span>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className="text-xl font-black italic tracking-tighter text-white">{sub.score}%</span>
                         </td>
                         <td className="p-6">
                            <Badge className={cn(
                               "rounded-lg px-3 py-1 font-black italic uppercase text-[9px] border-none shadow-sm",
                               sub.status === 'passed' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                               {sub.status}
                            </Badge>
                         </td>
                         <td className="p-6 text-[10px] font-black uppercase text-white/30 tracking-widest">
                            14m 22s
                         </td>
                         <td className="p-6 text-[10px] font-black uppercase text-white/30 tracking-widest">
                            {new Date(sub.created_at).toLocaleDateString()}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color = '#6c47ff' }: any) {
   return (
      <div className="bg-[#0b0b14] border border-white/5 rounded-[40px] p-8 space-y-4 hover:border-white/10 transition-all group">
         <div className="flex items-center gap-3">
            <div 
               className="h-10 w-10 rounded-2xl flex items-center justify-center border"
               style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, color: color }}
            >
               <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{label}</span>
         </div>
         <div>
            <div className="text-4xl font-black italic uppercase tracking-tighter text-white transition-transform group-hover:translate-x-1">{value}</div>
            <div className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-1">{sub}</div>
         </div>
      </div>
   );
}

function SpotlightItem({ label, value, rate, variant }: any) {
  return (
    <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
       <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          variant === 'remedial' ? "bg-rose-500" : "bg-emerald-500"
       )} />
       <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</span>
          <span className={cn(
             "text-[10px] font-black italic uppercase",
             variant === 'remedial' ? "text-rose-500" : "text-emerald-500"
          )}>{rate}</span>
       </div>
       <h4 className="font-bold text-white">{value}</h4>
    </div>
  );
}

function TableHead({ children }: any) {
   return <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">{children}</th>;
}
