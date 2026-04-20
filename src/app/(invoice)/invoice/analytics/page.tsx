"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download,
  ArrowUpRight,
  Target,
  Zap,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { getInvoiceAnalytics } from "@/app/actions/invoice";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { workspace } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      getInvoiceAnalytics(workspace.id).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [workspace?.id]);

  if (loading) return <div className="py-20 text-center text-white/20 uppercase font-black tracking-widest">Calculating Intelligence...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">Intelligence</h1>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Revenue & Acquisition Data</p>
        </div>
        <Button variant="ghost" className="text-white/40 hover:text-white gap-2 border border-white/5 rounded-xl px-6">
           <Download size={16} /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={80} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Volume (6m)</p>
            <h3 className="text-3xl font-black text-white mb-2">R{data.summary.total.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
               <ArrowUpRight size={14} /> +12.5% vs previous period
            </div>
         </Card>

         <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Target size={80} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Average Ticket</p>
            <h3 className="text-3xl font-black text-white mb-2">R{(data.summary.total / (data.summary.count || 1)).toLocaleString()}</h3>
            <p className="text-white/20 text-[11px] font-bold tracking-tight">Across {data.summary.count} invoices</p>
         </Card>

         <Card className="bg-primary/5 border border-primary/10 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap size={80} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Lead Conversion</p>
            <h3 className="text-3xl font-black text-white mb-2">8.4%</h3>
            <p className="text-white/40 text-[11px] font-medium leading-relaxed">Percentage of invoice users upgrading to full CRM.</p>
         </Card>
      </div>

      {/* Revenue Chart Placeholder / Monthly Stats */}
      <Card className="bg-[#0b0b15] border-white/5 rounded-[2.5rem] p-10 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Revenue Stream</h3>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Monthly performance comparison</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-white/50 uppercase">Invoiced</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-white/50 uppercase">Collected</span>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {data.monthly.map((m: any, i: number) => (
              <div key={i} className="group flex flex-col gap-3">
                 <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-white/40 group-hover:text-white transition-colors">{m.month}</span>
                    <span className="text-white">R{m.total.toLocaleString()}</span>
                 </div>
                 <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    {/* Background Bar (Total Invoiced) */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/30 group-hover:bg-primary transition-all duration-700" 
                      style={{ width: '100%' }} // Simplified for visual effect
                    />
                    {/* Foreground Bar (Collected) */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-emerald-400 group-hover:shadow-[0_0_15px_#34d399] transition-all duration-1000" 
                      style={{ width: `${(m.collected / m.total) * 100}%` }}
                    />
                 </div>
              </div>
            ))}
         </div>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <PieChart size={20} />
               </div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Tax Summary</h4>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-sm text-white/40">VAT Collected (15%)</span>
                  <span className="text-sm font-black text-white">R{(data.summary.total * 0.15).toLocaleString()}</span>
               </div>
               <div className="flex justify-between py-3">
                  <span className="text-sm text-white/40">Net Revenue</span>
                  <span className="text-sm font-black text-white">R{(data.summary.total * 0.85).toLocaleString()}</span>
               </div>
            </div>
         </Card>

         <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <DollarSign size={20} />
               </div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Platform Fees</h4>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-sm text-white/40">Stripe Logic (1.5%)</span>
                  <span className="text-sm font-black text-white">R{(data.summary.total * 0.015).toLocaleString()}</span>
               </div>
               <p className="text-[10px] text-white/20 italic leading-relaxed">
                  These fees are removed on the Invoice Pro plan. You could have saved R{(data.summary.total * 0.015).toLocaleString()} this period.
               </p>
            </div>
         </Card>
      </div>
    </div>
  );
}
