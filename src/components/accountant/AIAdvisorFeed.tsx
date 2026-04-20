'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIAlert {
    id: string;
    type: 'tax_deduction' | 'compliance_warning' | 'financial_health';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
}

interface Deadline {
    id: string;
    title: string;
    deadline_date: string;
    type: string;
    status: string;
}

export default function AIAdvisorFeed({ alerts, deadlines }: { alerts: AIAlert[], deadlines: Deadline[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Intelligence Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Intelligence Feed</h3>
            </div>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 px-3">{alerts.length} New Insights</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {alerts.length === 0 && (
                <Card className="bg-[#0b0b15] border-white/5 p-12 text-center border-dashed">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-4 opacity-20" size={48} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">All Systems Compliant. No immediate alerts.</p>
                </Card>
            )}
            
            {alerts.map((alert) => (
                <Card key={alert.id} className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl group hover:border-primary/30 transition-all relative overflow-hidden">
                    <div className={cn(
                        "absolute right-0 top-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 transition-transform group-hover:scale-110",
                        alert.type === 'tax_deduction' ? "text-emerald-500" : "text-amber-500"
                    )}>
                        {alert.type === 'tax_deduction' ? <Lightbulb size={128} /> : <AlertTriangle size={128} />}
                    </div>

                    <div className="flex gap-6 relative z-10">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            alert.type === 'tax_deduction' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                            {alert.type === 'tax_deduction' ? <Lightbulb size={24} /> : <AlertTriangle size={24} />}
                        </div>

                        <div className="space-y-2 pr-12">
                            <div className="flex items-center gap-3">
                                <h4 className="font-black text-white uppercase tracking-tight tracking-[0.05em]">{alert.title}</h4>
                                <Badge className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter",
                                    alert.priority === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-white/5 text-white/40 border-white/10"
                                )}>{alert.priority} PRIORITY</Badge>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed font-medium">{alert.description}</p>
                            
                            <div className="flex items-center gap-4 pt-2">
                                <Button variant="link" className="p-0 h-auto text-[10px] font-black text-primary uppercase tracking-widest gap-1 hover:no-underline group">
                                    Apply Strategy <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>

      {/* Compliance Calendar */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
            <Calendar className="text-sky-500" size={18} />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Compliance Calendar</h3>
        </div>

        <Card className="bg-[#0b0b15] border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
            {deadlines.length === 0 && (
                <div className="p-8 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest">No active deadlines detected</p>
                </div>
            )}
            
            {deadlines.map((item, i) => {
                const dateObj = new Date(item.deadline_date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('en-GB', { month: 'short' });
                
                return (
                    <div key={i} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="text-center w-10">
                                <span className="block text-[8px] font-black text-white/20 uppercase tracking-tighter mb-0.5 whitespace-nowrap">{month}</span>
                                <span className="block text-lg font-black text-white tracking-tight leading-none">{day}</span>
                            </div>
                            <div className="h-8 w-px bg-white/5" />
                            <div>
                                <h5 className="text-[10px] font-black text-white uppercase tracking-tight">{item.title}</h5>
                                <p className="text-[8px] font-black text-sky-500/60 uppercase tracking-widest mt-1">{item.type} Submission</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn(
                            "text-[8px] border-white/5 uppercase font-black tracking-widest",
                            item.status === 'pending' ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-white/20"
                        )}>{item.status}</Badge>
                    </div>
                );
            })}
            
            <div className="p-6 bg-white/[0.01]">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <Info className="text-primary shrink-0" size={16} />
                    <p className="text-[10px] font-bold text-white/40 leading-relaxed italic">Your SARS Compliance score is currently <span className="text-emerald-500">92%</span>. Maintain this to stay in the Good Standing register.</p>
                </div>
            </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="bg-[#04040a] border-white/5 p-8 rounded-3xl space-y-6">
            <div className="space-y-1">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Financial Runway</h4>
                <div className="flex items-end justify-between">
                    <h2 className="text-2xl font-black text-white tracking-tight italic">9 MONTHS</h2>
                    <TrendingDown className="text-rose-500 mb-1" size={16} />
                </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest italic leading-relaxed">Based on current cash-on-hand vs. average monthly burn rate.</p>
        </Card>
      </div>
    </div>
  );
}
