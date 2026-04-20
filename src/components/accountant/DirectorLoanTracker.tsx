'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle,
  Waves,
  Scale,
  Percent,
  History,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { updateDirectorLoan } from '@/app/actions/accountant';
import { toast } from 'sonner';

export default function DirectorLoanTracker({ workspaceId, initialData, transactions }: { workspaceId: string, initialData: any, transactions: any[] }) {
  const [balance, setBalance] = useState(initialData?.balance || 0);
  const [isSaving, setIsSaving] = useState(false);
  const officialRate = 8.25;

  const isOverdrawn = balance > 0;
  const annualInterest = (balance * (officialRate / 100));

  const handleAdjust = async (amount: number) => {
    try {
      setIsSaving(true);
      const newBalance = balance + amount;
      await updateDirectorLoan(workspaceId, {
        director_name: 'Primary Director',
        balance: newBalance,
        interest_rate: officialRate,
        is_overdrawn: newBalance > 0,
        oldBalance: balance
      });
      setBalance(newBalance);
      toast.success("Loan Balance Updated");
    } catch (e) {
      toast.error("Failed to update loan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={cn(
          "lg:col-span-2 p-8 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden transition-all",
          isOverdrawn ? "bg-rose-500/5 border-rose-500/20" : "bg-emerald-500/5 border-emerald-500/20"
        )}>
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <User className={isOverdrawn ? "text-rose-500" : "text-emerald-500"} size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Current Account Balance</h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-none mt-1">Director: John Doe</p>
                 </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2",
                isOverdrawn ? "border-rose-500/30 bg-rose-500/10 text-rose-500" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              )}>
                 <div className={cn("w-2 h-2 rounded-full", isOverdrawn ? "bg-rose-500" : "bg-emerald-500")} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{isOverdrawn ? "Overdrawn" : "In Credit"}</span>
              </div>
           </div>

           <div className="space-y-2 relative z-10">
              <div className="flex items-baseline gap-3">
                 <span className="text-6xl font-black text-white tracking-tighter">R{balance.toLocaleString()}</span>
                 <span className="text-white/20 font-black text-xl uppercase tracking-widest leading-none">ZAR</span>
              </div>
              {isOverdrawn && (
                <div className="flex items-center gap-2 text-rose-500/80">
                   <AlertTriangle size={14} />
                   <p className="text-xs font-bold uppercase tracking-widest">Potential Fringe Benefit Tax applies if interest is not charged.</p>
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <Button 
                onClick={() => handleAdjust(10000)}
                disabled={isSaving}
                className="h-16 bg-white/5 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 gap-2 transition-all"
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : <><ArrowUpRight size={18} /> Record Drawing</>}
              </Button>
              <Button 
                onClick={() => handleAdjust(-10000)}
                disabled={isSaving}
                className="h-16 bg-white/5 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 gap-2 transition-all"
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : <><ArrowDownLeft size={18} /> Repay Loan</>}
              </Button>
           </div>

           {/* Backdrop Decor */}
           <Waves className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.02] -rotate-12 pointer-events-none" />
        </Card>

        {/* Compliance Card */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-8">
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-primary mb-4">
                    <Scale size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">SARS Compliance</span>
                 </div>
                 
                 <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-white/40 uppercase tracking-widest">Official Rate</span>
                       <span className="text-lg font-black text-white">{officialRate}%</span>
                    </div>
                    <Progress value={officialRate * 8} className="h-1 bg-white/5 [&>div]:bg-primary" />
                 </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-xs font-black text-white/40 uppercase tracking-widest">Accrued Int. (Annual)</span>
                  <p className="text-2xl font-black text-white">R{annualInterest.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                 <Percent className="text-amber-500 shrink-0" size={16} />
                 <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed italic uppercase">AI Tip: Consider converting a portion to Dividends at 20% to avoid rising loan interest.</p>
              </div>
           </div>
        </Card>
      </div>

      {/* History */}
      <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
         <div className="flex items-center gap-3 mb-8">
            <History size={20} className="text-white/20" />
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Recent Activity</h4>
         </div>
         <div className="space-y-4">
            {transactions?.length > 0 ? (
               transactions.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest w-24">
                           {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-bold text-white/80">{item.description}</div>
                     </div>
                     <div className={cn(
                        "text-sm font-black text-rose-500"
                     )}>
                        R{parseFloat(item.total_amount).toLocaleString()}
                     </div>
                  </div>
               ))
            ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                     <History className="text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">No recent transactions recorded</p>
               </div>
            )}
         </div>
      </Card>
    </div>
  );
}
