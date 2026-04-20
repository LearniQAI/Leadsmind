"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Download,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/AuthProvider";
import { getRecentInvoices } from "@/app/actions/invoice";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InvoicesListPage() {
  const { workspace } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (workspace?.id) {
      getRecentInvoices(workspace.id, 100).then(data => {
        setInvoices(data);
        setLoading(false);
      });
    }
  }, [workspace?.id]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ["Invoice #", "Client", "Email", "Amount", "Status", "Date", "Due Date"];
    const csvData = filteredInvoices.map(inv => [
      inv.invoice_number,
      `${inv.contact?.first_name} ${inv.contact?.last_name}`,
      inv.contact?.email,
      inv.total_amount,
      inv.status,
      format(new Date(inv.created_at), "yyyy-MM-dd"),
      inv.due_date ? format(new Date(inv.due_date), "yyyy-MM-dd") : ""
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">Invoices</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Manage your billing and payments</p>
        </div>
        <Link href="/invoice/invoices/new">
          <Button className="!bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl px-6 h-12 shadow-xl shadow-[#6c47ff]/20 transition-all border-none font-black uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0b0b15] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input
            placeholder="Search by invoice # or client..."
            className="pl-12 bg-black/20 border-white/5 h-11 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 gap-2 px-4 rounded-xl h-11 border border-transparent hover:border-white/10">
                <Filter size={16} />
                {statusFilter === "all" ? "Filter" : statusFilter.toUpperCase()}
              </Button>
            } />
            <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Invoices</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("paid")}>Paid Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>Overdue Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Drafts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            onClick={handleExport}
            className="text-white/40 hover:text-white hover:bg-white/5 gap-2 px-4 rounded-xl h-11 border border-transparent hover:border-white/10"
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#0b0b15] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Invoice</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-white/20 italic">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FileText size={48} className="text-white/5" />
                      <p className="text-white/40 font-medium tracking-tight">No invoices found matching your criteria.</p>
                      <Link href="/invoice/invoices/new">
                        <Button variant="link" className="text-primary font-bold">Create your first invoice</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                      inv.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        inv.status === 'overdue' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                          inv.status === 'open' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full",
                        inv.status === 'paid' ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" :
                          inv.status === 'overdue' ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" :
                            "bg-white/20"
                      )} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white/90 group-hover:text-primary transition-colors cursor-pointer">
                        {inv.invoice_number}
                      </span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                        Created {format(new Date(inv.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white/80">
                        {inv.contact ? `${inv.contact.first_name} ${inv.contact.last_name}` : 'Unknown Client'}
                      </span>
                      <span className="text-[10px] text-white/30">{inv.contact?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-white">R{Number(inv.total_amount).toLocaleString()}</span>
                      {inv.amount_paid > 0 && <span className="text-[10px] text-emerald-400/60 font-medium">Paid R{Number(inv.amount_paid).toLocaleString()}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-white/50 font-medium">
                      {inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : '--'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5 group-hover:text-white/60">
                        <Send size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5">
                            <MoreVertical size={16} />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white min-w-[160px]">
                          <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer py-2.5">
                            <Download size={14} /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer py-2.5">
                            <ExternalLink size={14} /> View Portal
                          </DropdownMenuItem>
                          <div className="h-px bg-white/5 my-1" />
                          <DropdownMenuItem className="gap-2 focus:bg-rose-500/20 text-rose-500 cursor-pointer py-2.5">
                            Void Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Showing {filteredInvoices.length} of {invoices.length} invoices</p>
          <div className="flex items-center gap-1">
            <Button disabled variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border-white/5 text-white/20">
              <ChevronLeft size={14} />
            </Button>
            <Button disabled variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border-white/5 text-white/20">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
