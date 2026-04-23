import { requireAuth } from '@/lib/auth';
import { getFinancialSummary } from '@/app/actions/accounting';
import { Button } from '@/components/ui/button';
import { 
  Receipt, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Download,
  Filter,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const summaryResult = await getFinancialSummary();
  const summary = summaryResult.success ? summaryResult.data : { income: 0, expenses: 0, profit: 0 };

  const supabase = await createServerClient();
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('workspace_id', workspaceId!)
    .order('date', { ascending: false });

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Financial Ledger</h1>
          <p className="text-sm text-white/40 font-medium">Monitor your expenses and business profitability.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-11 px-6 rounded-xl gap-2 font-bold text-white/40 hover:text-white hover:bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest transition-all">
              <Download size={16} />
              <span>Export</span>
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-5 w-5" />
              <span>Log Expense</span>
            </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
            title="Total Revenue" 
            value={summary?.income || 0} 
            icon={TrendingUp} 
            color="text-emerald-400"
            bg="bg-emerald-500/10"
        />
        <KpiCard 
            title="Total Expenses" 
            value={summary?.expenses || 0} 
            icon={TrendingDown} 
            color="text-rose-400"
            bg="bg-rose-500/10"
        />
        <KpiCard 
            title="Net Profit" 
            value={summary?.profit || 0} 
            icon={Wallet} 
            color="text-blue-400"
            bg="bg-blue-500/10"
        />
      </div>

      <div className="bg-[#0b0b10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <PieChart className="h-5 w-5 text-white/20" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Recent Transactions</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold text-white/20 hover:text-white hover:bg-white/5">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-widest">Filter</span>
            </Button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Merchant / Desc</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Category</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses?.map((expense) => (
                        <tr key={expense.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-5 text-sm font-bold text-white/40">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="px-8 py-5">
                                <p className="text-sm font-bold text-white">{expense.merchant || 'Unknown'}</p>
                                <p className="text-[10px] text-white/20 font-medium truncate max-w-[200px]">{expense.description}</p>
                            </td>
                            <td className="px-8 py-5">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                                    {expense.category}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right font-black text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency || 'USD' }).format(expense.amount)}
                            </td>
                        </tr>
                    ))}
                    {(!expenses || expenses.length === 0) && (
                        <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-10">
                                    <Receipt className="h-12 w-12" />
                                    <p className="text-xs font-black uppercase tracking-widest">No expenses logged yet</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, bg }: { title: string; value: number; icon: any; color: string; bg: string }) {
    return (
        <div className="bg-[#0b0b10] border border-white/5 rounded-[2rem] p-8 space-y-4 shadow-xl relative group overflow-hidden">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", bg, color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{title}</p>
                <p className="text-3xl font-black text-white tracking-tighter italic">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                </p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Icon className="h-24 w-24" />
            </div>
        </div>
    );
}
