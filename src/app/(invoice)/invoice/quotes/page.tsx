"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  FileSearch, 
  MoreVertical, 
  FileText,
  CheckCircle,
  Clock,
  ExternalLink
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
import { getRecentQuotes, convertToInvoice } from "@/app/actions/invoice";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function QuotesListPage() {
  const { workspace } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    if (workspace?.id) {
      getRecentQuotes(workspace.id, 100).then(data => {
        setQuotes(data);
        setLoading(false);
      });
    }
  }, [workspace?.id]);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleConvert = async (quoteId: string) => {
    if (!workspace?.id) return;
    try {
      setConvertingId(quoteId);
      const invoice = await convertToInvoice(workspace.id, quoteId);
      toast.success("Quote converted to invoice successfully!");
      router.push("/invoice/invoices");
    } catch (error) {
      toast.error("Failed to convert quote");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">Quotes</h1>
           <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Send estimates to your clients</p>
        </div>
        <Link href="/invoice/quotes/new">
          <Button className="!bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl px-6 h-12 shadow-xl shadow-[#6c47ff]/20 font-black uppercase tracking-widest border-none">
            <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Table & Search */}
      <Card className="bg-[#0b0b15] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <Input 
              placeholder="Search quotes..." 
              className="pl-10 bg-black/20 border-white/5 h-10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'draft', 'sent', 'accepted'].map(status => (
              <Button 
                key={status} 
                variant="ghost" 
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg border border-transparent transition-all",
                  statusFilter === status ? "bg-primary/10 text-primary border-primary/20" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Quote #</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Valid Until</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-white/20 italic">Loading quotes...</td></tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
                            <FileSearch className="text-white/10" size={32} />
                         </div>
                         <p className="text-white/40 font-medium tracking-tight">No estimates found.</p>
                      </div>
                   </td>
                </tr>
              ) : filteredQuotes.map((quote) => (
                <tr key={quote.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white/90 group-hover:text-primary transition-colors cursor-pointer">{quote.quote_number}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white/80">
                        {quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : 'Unknown Client'}
                      </span>
                      <span className="text-[10px] text-white/30">{quote.contact?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                      quote.status === 'accepted' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      quote.status === 'sent' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full",
                        quote.status === 'accepted' ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" :
                        quote.status === 'sent' ? "bg-amber-500" :
                        "bg-white/20"
                      )} />
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-extrabold text-white">R{Number(quote.total_amount).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-white/30 text-sm font-medium">
                    {quote.valid_until ? format(new Date(quote.valid_until), "MMM d, yyyy") : '--'}
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-3">
                        {quote.status === 'accepted' || quote.status === 'sent' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={convertingId === quote.id}
                            onClick={() => handleConvert(quote.id)}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest h-9 px-4 border border-emerald-500/10 transition-all hover:scale-[1.02]"
                          >
                             {convertingId === quote.id ? (
                               <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent animate-spin rounded-full" />
                             ) : <CheckCircle size={14} />}
                             Convert
                          </Button>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5">
                              <MoreVertical size={16} />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white min-w-[160px]">
                             <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer py-2.5">
                                <FileText size={14} /> Edit Quote
                             </DropdownMenuItem>
                             <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer py-2.5">
                                <ExternalLink size={14} /> Share Link
                             </DropdownMenuItem>
                             <div className="h-px bg-white/5 my-1" />
                             <DropdownMenuItem className="gap-2 focus:bg-rose-500/20 text-rose-500 cursor-pointer py-2.5">
                                Delete Quote
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
      </Card>
    </div>
  );
}

