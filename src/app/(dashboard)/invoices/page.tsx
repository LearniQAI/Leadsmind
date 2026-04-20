import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getInvoices } from "@/app/actions/finance";
import { 
  Plus, 
  Search, 
  Filter, 
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const invoices = await getInvoices(workspaceId!);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Invoices</h1>
          <p className="text-sm text-white/40 mt-1">Manage your billings and client payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/invoices/new">
            <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-bold px-6 h-12 shadow-[0_8px_16px_-4px_rgba(108,71,255,0.3)] transition-all">
              <Plus size={18} />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: `$${invoices.reduce((a, b) => a + (b.total_amount || 0), 0).toLocaleString()}`, color: 'blue' },
          { label: 'Paid', value: `$${invoices.filter(i => i.status === 'paid').reduce((a, b) => a + (b.total_amount || 0), 0).toLocaleString()}`, color: 'emerald' },
          { label: 'Pending', value: `$${invoices.filter(i => i.status === 'open').reduce((a, b) => a + (b.total_amount || 0), 0).toLocaleString()}`, color: 'amber' },
          { label: 'Overdue', value: '$0', color: 'rose' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/3 border border-white/5 rounded-[24px] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{stat.label}</p>
            <p className={cn(
              "text-2xl font-black text-white",
              stat.color === 'emerald' && "text-emerald-400",
              stat.color === 'amber' && "text-amber-400",
              stat.color === 'rose' && "text-rose-400"
            )}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/3 border border-white/5 p-4 rounded-[32px]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input 
            placeholder="Search invoice #, client or amount..." 
            className="pl-12 h-12 bg-white/5 border-white/5 text-white rounded-2xl focus:ring-[#6c47ff]/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="secondary" className="bg-white/5 border-white/10 text-white gap-2 flex-1 md:flex-none rounded-xl h-11">
            <Filter size={16} />
            Filters
          </Button>
          <Button variant="secondary" className="bg-white/5 border-white/10 text-white gap-2 flex-1 md:flex-none rounded-xl h-11">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Invoices List */}
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
