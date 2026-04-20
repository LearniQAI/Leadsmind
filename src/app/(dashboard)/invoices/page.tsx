import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getInvoices, getInvoiceSettings } from "@/app/actions/finance";
  AlertCircle,
  Eye,
  FileEdit,
  Mail,
  Trash
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { deleteInvoice, markInvoicePaid } from "@/app/actions/finance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
      <div className="bg-white/3 border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Invoice #</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Client</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <ReceiptText size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/30 font-bold uppercase tracking-widest">No invoices found</p>
                    <p className="text-xs text-white/10 mt-2">Create your first invoice to get started.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-white/2 transition-all">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{invoice.invoice_number}</p>
                      <p className="text-[10px] text-white/20 font-mono mt-0.5">{invoice.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#6c47ff]/10 border border-[#6c47ff]/20 flex items-center justify-center text-[10px] font-black text-[#6c47ff]">
                          {invoice.contact?.first_name?.[0]}{invoice.contact?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{invoice.contact?.first_name} {invoice.contact?.last_name}</p>
                          <p className="text-[11px] text-white/30">{invoice.contact?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white/40">
                         <Clock size={14} />
                         <span className="text-xs font-medium">
                            {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'No date'}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">${invoice.total_amount.toLocaleString()}</p>
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">{invoice.currency}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        invoice.status === 'paid' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : 
                        invoice.status === 'open' ? "bg-blue-500/5 border-blue-500/10 text-blue-400" : 
                        "bg-white/5 border-white/10 text-white/30"
                      )}>
                        {invoice.status === 'paid' && <CheckCircle2 size={12} />}
                        {invoice.status === 'open' && <Clock size={12} />}
                        {invoice.status === 'void' && <AlertCircle size={12} />}
                        {invoice.status}
                      </div>
                    </td>
                     <td className="px-6 py-5 text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/20 hover:text-white hover:bg-white/5">
                             <MoreVertical size={16} />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 bg-[#0b0b14] border-white/10 rounded-2xl shadow-2xl p-2">
                           <Link href={`/invoices/${invoice.id}/edit`}>
                             <DropdownMenuItem className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-white/70">
                               <FileEdit size={14} className="text-blue-400" />
                               Edit Invoice
                             </DropdownMenuItem>
                           </Link>
                           <DropdownMenuItem className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-white/70">
                             <Eye size={14} className="text-[#6c47ff]" />
                             View Web Invoice
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className="bg-white/5" />
                           {invoice.status === 'draft' && (
                             <DropdownMenuItem className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-emerald-400">
                               <Mail size={14} />
                               Send to Client
                             </DropdownMenuItem>
                           )}
                           {invoice.status !== 'paid' && (
                             <DropdownMenuItem 
                               onClick={() => {
                                 toast.promise(markInvoicePaid(invoice.id), {
                                   loading: 'Updating status...',
                                   success: 'Marked as paid',
                                   error: 'Failed to update'
                                 });
                               }}
                               className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-emerald-400"
                             >
                               <CheckCircle2 size={14} />
                               Mark as Paid
                             </DropdownMenuItem>
                           )}
                           <DropdownMenuSeparator className="bg-white/5" />
                           <DropdownMenuItem 
                             onClick={() => {
                               if (confirm("Are you sure you want to delete this invoice?")) {
                                 toast.promise(deleteInvoice(invoice.id), {
                                   loading: 'Deleting...',
                                   success: 'Invoice deleted',
                                   error: 'Delete failed'
                                 });
                               }
                             }}
                             className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-rose-500"
                           >
                             <Trash size={14} />
                             Delete Invoice
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
