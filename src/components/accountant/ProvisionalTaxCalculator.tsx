'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calculator, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Info,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { saveProvisionalTax } from '@/app/actions/accountant';
import { toast } from 'sonner';

export default function ProvisionalTaxCalculator({ workspaceId, initialData }: { workspaceId: string, initialData: any[] }) {
  const latest = initialData?.[0] || {};
  const [income, setIncome] = useState<string>(latest.estimated_taxable_income?.toString() || '0');
  const [expenses, setExpenses] = useState<string>('0');
  const [isSaving, setIsSaving] = useState(false);
  
  const taxableIncome = Math.max(0, parseFloat(income) - parseFloat(expenses));
  const estimatedTax = taxableIncome * 0.27; 

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveProvisionalTax(workspaceId, {
        period_year: 2026,
        period_type: 'P1',
        estimated_taxable_income: taxableIncome,
        estimated_tax_liability: estimatedTax,
        status: 'draft'
      });
      toast.success("Statutory IRP6 Draft Created");
    } catch (e) {
      toast.error("Failed to save tax record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Controls */}
        <Card className="lg:col-span-2 bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                 <Calculator className="text-primary" />
              </div>
              <div>
                 <h3 className="font-black text-white uppercase tracking-tight">Taxable Income Estimator</h3>
                 <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Based on SARS IRP6 Requirements</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Total Estimated Revenue</label>
                 <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">R</span>
                    <Input 
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="h-14 bg-white/[0.02] border-white/10 rounded-2xl pl-10 font-black text-lg focus:ring-primary/20 focus:border-primary/50 transition-all" 
                    />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Estimated Allowable Expenses</label>
                 <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">R</span>
                    <Input 
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        className="h-14 bg-white/[0.02] border-white/10 rounded-2xl pl-10 font-black text-lg focus:ring-primary/20 focus:border-primary/50 transition-all" 
                    />
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
              <Info className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed font-bold">
                 SARS requires companies to pay 50% of their estimated tax liability by August 31 (P1) and the remainder by February 28 (P2).
              </p>
           </div>
        </Card>

        {/* Results Sidebar */}
        <Card className="bg-primary/10 border-primary/20 p-8 rounded-3xl space-y-8 flex flex-col justify-between">
           <div className="space-y-4 text-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Estimated Tax Due</span>
              <div className="space-y-1">
                 <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                    R{estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none">Full Annual Liability</p>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Aug 31 (P1 Payment)</span>
                    <span className="text-white">R{(estimatedTax / 2).toLocaleString()}</span>
                 </div>
                 <Progress value={50} className="h-1.5 bg-white/5 [&>div]:bg-primary" />
              </div>

              <div className="space-y-2 text-center pt-4 border-t border-white/5">
                 <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-[#6c47ff]/30 group transition-all"
                 >
                    {isSaving ? <Loader2 className="animate-spin" /> : (
                        <>
                        Generate IRP6 Draft
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                 </Button>
              </div>
           </div>
        </Card>
      </div>

      {/* Deadlines Timeline */}
      <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
         <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Compliance Deadlines</h4>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
               <ShieldCheck className="text-emerald-500 w-3 h-3" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Monitored</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                     <Calendar className="text-amber-500" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">August 31, 2026</span>
                     <p className="font-black text-white tracking-tight uppercase">First Provisional (P1)</p>
                  </div>
               </div>
               <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                     <Calendar className="text-white/40" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">February 28, 2027</span>
                     <p className="font-black text-white tracking-tight uppercase">Second Provisional (P2)</p>
                  </div>
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}
