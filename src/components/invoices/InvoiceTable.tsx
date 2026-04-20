'use client';

import { 
  AlertCircle,
  Eye,
  FileEdit,
  Mail,
  Trash,
  MoreVertical,
  Clock,
  CheckCircle2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteInvoice, markInvoicePaid } from "@/app/actions/finance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceTableProps {
  invoices: any[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();

  const handleMarkPaid = async (id: string) => {
    toast.promise(markInvoicePaid(id), {
      loading: 'Updating status...',
      success: () => {
        router.refresh();
        return 'Marked as paid';
      },
      error: 'Failed to update'
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    toast.promise(deleteInvoice(id), {
      loading: 'Deleting...',
      success: () => {
        router.refresh();
        return 'Invoice deleted';
      },
      error: 'Delete failed'
    });
  };

  return (
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
                  <Clock size={48} className="mx-auto text-white/5 mb-4" />
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
                    <p className="text-sm font-black text-white">${(invoice.total_amount || 0).toLocaleString()}</p>
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
                      <DropdownMenuTrigger>
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
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkPaid(invoice.id)}
                            className="flex items-center gap-2 rounded-xl focus:bg-white/5 cursor-pointer text-emerald-400"
                          >
                            <CheckCircle2 size={14} />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(invoice.id)}
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
  );
}
