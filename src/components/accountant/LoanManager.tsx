'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart4, 
  Landmark, 
  Clock, 
  ArrowRight,
  TrendingDown,
  PieChart,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addBusinessLoan } from '@/app/actions/accountant';
import { toast } from 'sonner';

export default function LoanManager({ workspaceId, initialData }: { workspaceId: string, initialData: any[] }) {
  const [loans, setLoans] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newLoan, setNewLoan] = useState({
    lender_name: '',
    principal_amount: '',
    interest_rate: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const handleAddLoan = async () => {
    try {
      setIsSaving(true);
      const principal = parseFloat(newLoan.principal_amount);
      const res = await addBusinessLoan(workspaceId, {
        ...newLoan,
        principal_amount: principal,
        current_balance: principal,
        interest_rate: parseFloat(newLoan.interest_rate),
        repayment_schedule: 'monthly'
      });
      setLoans([...loans, res]);
      setIsAdding(false);
      setNewLoan({ lender_name: '', principal_amount: '', interest_rate: '', start_date: new Date().toISOString().split('T')[0] });
      toast.success("New Loan Agreement Recorded");
    } catch (e) {
      toast.error("Failed to record loan");
    } finally {
      setIsSaving(false);
    }
  };

  const totalDebt = loans.reduce((acc, curr) => acc + parseFloat(curr.current_balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">External Debt & Liabilities</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Interest Accrual & Repayment Monitoring</p>
         </div>
         {!isAdding && (
            <Button 
                onClick={() => setIsAdding(true)}
                className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 font-black uppercase tracking-widest text-xs px-6 shadow-xl shadow-primary/20"
            >
                <Plus size={16} strokeWidth={3} />
                Add New Loan
            </Button>
         )}
      </div>

      {isAdding && (
        <Card className="bg-[#0b0b15] border-primary/20 p-8 rounded-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-white uppercase tracking-tight">Setup New Credit Facility</h4>
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/20 hover:text-rose-500">
                    <X size={20} />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Lender Name</label>
                    <Input 
                        placeholder="e.g. Standard Bank" 
                        value={newLoan.lender_name}
                        onChange={e => setNewLoan({...newLoan, lender_name: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Principal (R)</label>
                    <Input 
                        type="number"
                        placeholder="0.00" 
                        value={newLoan.principal_amount}
                        onChange={e => setNewLoan({...newLoan, principal_amount: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Interest Rate (%)</label>
                    <Input 
                        type="number"
                        placeholder="11.5" 
                        value={newLoan.interest_rate}
                        onChange={e => setNewLoan({...newLoan, interest_rate: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl font-bold"
                    />
                </div>
                <div className="pt-6">
                    <Button 
                        onClick={handleAddLoan}
                        disabled={isSaving || !newLoan.lender_name}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : "Record Loan"}
                    </Button>
                </div>
            </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {loans.map((loan, i) => (
            <Card key={i} className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                     <Landmark className="text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Interest Rate</span>
                     <span className="text-lg font-black text-primary italic">{loan.interest_rate}%</span>
                  </div>
               </div>

               <div className="space-y-1 mb-8 relative z-10">
                  <h4 className="text-lg font-black text-white tracking-tight uppercase">{loan.lender_name}</h4>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-black text-white">R{parseFloat(loan.current_balance).toLocaleString()}</span>
                     <span className="text-white/20 text-xs font-black uppercase tracking-widest">Remaining</span>
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <div className="flex items-center gap-2 text-white/40">
                        <Clock size={12} className="text-amber-500" />
                        Facility Started: <span className="text-white">{loan.start_date}</span>
                     </div>
                     <span className="text-[#6c47ff]">View Schedule</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                     <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
                  </div>
               </div>

               <TrendingDown className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-[0.02] -rotate-12 pointer-events-none group-hover:opacity-[0.05] transition-opacity" />
            </Card>
         ))}
      </div>

      {loans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6c47ff]/10 rounded-xl flex items-center justify-center">
                   <PieChart className="text-[#6c47ff]" size={20} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block leading-none mb-1">Total Debt</span>
                   <span className="text-xl font-black text-white">R{totalDebt.toLocaleString()}</span>
                </div>
             </Card>
          </div>
      )}

      {loans.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 select-none">
             <Landmark size={48} className="mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">No active loan agreements recorded</p>
          </div>
      )}
    </div>
  );
}
