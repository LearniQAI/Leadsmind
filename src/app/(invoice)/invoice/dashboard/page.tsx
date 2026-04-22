"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Send,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../../../../components/providers/AuthProvider";
import { getInvoiceStats, getRecentInvoices } from "@/app/actions/finance";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StandaloneDashboard() {
  const { workspace } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      Promise.all([
        getInvoiceStats(workspace.id),
        getRecentInvoices(workspace.id)
      ]).then(([s, r]) => {
        setStats(s);
        setRecent(r);
        setLoading(false);
      });
    }
  }, [workspace?.id]);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { label: "Total Invoiced", value: stats.total_invoiced, icon: FileText, color: "text-white" },
    { label: "Collected", value: stats.collected, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Outstanding", value: stats.outstanding, icon: Clock, color: "text-amber-400" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
            OVERVIEW
          </h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
            Your billing performance at a glance
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoice/quotes/new">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              New Quote
            </Button>
          </Link>
          <Link href="/invoice/invoices/new">
            <Button className="!bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl shadow-xl shadow-[#6c47ff]/40 px-8 h-12 font-black uppercase tracking-[0.1em] border-none">
              <Plus className="w-5 h-5 mr-1" strokeWidth={3} />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl group hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <card.icon className={card.color} size={18} />
              </div>
              <ArrowUpRight className="text-white/10 group-hover:text-primary transition-colors" size={16} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className={cn("text-2xl font-black", card.color)}>
              R{card.value.toLocaleString()}
            </h3>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Invoices Table */}
        <Card className="bg-[#0b0b15] border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Invoices</h3>
            <Link href="/invoice/invoices" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/2">
                <tr className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Number</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/90">
                          {inv.contact ? `${inv.contact.first_name} ${inv.contact.last_name}` : 'Unknown Client'}
                        </span>
                        <span className="text-[10px] text-white/30">{inv.contact?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-white/50">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">R{Number(inv.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter",
                        inv.status === 'paid' ? "bg-emerald-500/10 text-emerald-400" :
                          inv.status === 'overdue' ? "bg-rose-500/10 text-rose-500" :
                            "bg-white/5 text-white/40"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] text-white/30">
                      {format(new Date(inv.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
