'use client';

import React, { useState } from 'react';
import {
   Search,
   Plus,
   Download,
   MoreHorizontal,
   Calendar,
   User,
   FileText,
   ChevronRight,
   Printer,
   X,
   CheckCircle2,
   AlertTriangle,
   Clock,
   ArrowRight,
   ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InvoiceMasterDetailProps {
   invoices: any[];
}

export function InvoiceMasterDetail({ invoices }: InvoiceMasterDetailProps) {
   const [selectedId, setSelectedId] = useState<string | null>(invoices[0]?.id || null);
   const [search, setSearch] = useState('');

   const selectedInvoice = invoices.find(i => i.id === selectedId);
   const filteredInvoices = invoices.filter(i =>
      i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      i.contact?.full_name?.toLowerCase().includes(search.toLowerCase())
   );

   const handleDownload = () => {
      toast.promise(
         new Promise((resolve) => setTimeout(resolve, 2000)),
         {
            loading: 'Generating encrypted PDF...',
            success: 'Invoice downloaded successfully',
            error: 'Generation failed'
         }
      );
   };

   return (
      <div className="flex h-[calc(100vh-140px)] -m-6 overflow-hidden bg-[#050508]">
         {/* Left Sidebar List */}
         <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#0b0b14]/50">
            <div className="p-6 space-y-4 border-b border-white/5">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Billing <span className="text-white/20">Ledger</span></h2>
                  <Button size="icon" className="h-8 w-8 rounded-lg bg-[#6c47ff] hover:bg-[#5b3ce0]">
                     <Plus className="h-4 w-4" />
                  </Button>
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Filter transactions..."
                     className="pl-10 h-10 bg-white/5 border-white/5 rounded-xl text-xs font-bold"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-1">
               {filteredInvoices.map((inv) => (
                  <button
                     key={inv.id}
                     onClick={() => setSelectedId(inv.id)}
                     className={cn(
                        "w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        selectedId === inv.id
                           ? "bg-[#6c47ff]/10 border border-[#6c47ff]/20"
                           : "hover:bg-white/[0.02] border border-transparent"
                     )}
                  >
                     {selectedId === inv.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c47ff]" />
                     )}
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff]">{inv.invoice_number}</span>
                        <span className="text-sm font-black text-white italic tracking-tight">${Number(inv.total_amount).toLocaleString()}</span>
                     </div>
                     <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">{inv.contact?.full_name || 'Generic Client'}</h4>
                     <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium">
                           <Calendar className="h-3 w-3" />
                           {format(new Date(inv.created_at), 'dd MMM yyyy')}
                        </div>
                        <StatusBadge status={inv.status} />
                     </div>
                  </button>
               ))}
            </div>
         </div>

         {/* Right Content Area */}
         <div className="flex-1 bg-[#050508] overflow-y-auto scrollbar-none p-12">
            {selectedInvoice ? (
               <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between bg-[#0b0b14] p-6 rounded-[32px] border border-white/5 shadow-2xl">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                           <FileText className="h-6 w-6 text-white/20" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Invoice Detail</h3>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{selectedInvoice.invoice_number} • Issued on {format(new Date(selectedInvoice.created_at), 'MMMM dd, yyyy')}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button
                           onClick={handleDownload}
                           className="h-12 px-6 rounded-xl bg-white text-black font-black italic uppercase text-xs gap-2 hover:bg-white/90"
                        >
                           <Download className="h-4 w-4" />
                           Download PDF
                        </Button>
                        <Button variant="outline" className="h-12 px-4 rounded-xl bg-white/5 border-white/10 text-white/40 hover:text-white">
                           <MoreHorizontal className="h-5 w-5" />
                        </Button>
                     </div>
                  </div>

                  <div className="bg-[#0b0b14] p-16 rounded-[48px] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c47ff]/5 blur-[120px] rounded-full pointer-events-none" />

                     {/* Visual elements like the screenshot */}
                     <div className="flex justify-between items-start mb-24 relative z-10">
                        <div>
                           <div className="h-12 w-48 bg-white text-black rounded-2xl flex items-center justify-center font-black italic mb-6 tracking-tighter">LEADSMIND</div>
                           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 space-y-2">
                              <p>123 Enterprise Avenue</p>
                              <p>Silicon Valley, CA 94043</p>
                              <p>contact@leadsmind.ai</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white mb-2">Invoice</h1>
                           <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.3em]">{selectedInvoice.invoice_number}</span>
                              <StatusBadge status={selectedInvoice.status} />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-20 mb-24 relative z-10">
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff] mb-4 block">Recipient Information</span>
                           <h2 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter">{selectedInvoice.contact?.full_name}</h2>
                           <p className="text-xs font-bold text-white/40 leading-relaxed max-w-xs">{selectedInvoice.contact?.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-6">
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Issuance Date</span>
                              <span className="text-sm font-black italic text-white">{format(new Date(selectedInvoice.created_at), 'dd MMM yyyy') || 'N/A'}</span>
                           </div>
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Settlement Due</span>
                              <span className="text-sm font-black italic text-rose-500">{selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'dd MMM y') : 'Immediate'}</span>
                           </div>
                        </div>
                     </div>

                     <table className="w-full mb-24 text-left relative z-10">
                        <thead>
                           <tr className="border-b border-white/5">
                              <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Description</th>
                              <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Units</th>
                              <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Rate</th>
                              <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {selectedInvoice.items?.map((item: any, idx: number) => (
                              <tr key={idx} className="group/row">
                                 <td className="py-8 font-black italic uppercase text-sm text-white/80 group-hover/row:text-white transition-colors">{item.description}</td>
                                 <td className="py-8 text-right font-black italic text-white/40">{item.quantity || 1}</td>
                                 <td className="py-8 text-right font-black italic text-white/40">${Number(item.unit_amount || 0).toLocaleString()}</td>
                                 <td className="py-8 text-right font-black italic text-white text-lg">${(Number(item.quantity || 1) * Number(item.unit_amount || 0)).toLocaleString()}</td>
                              </tr>
                           ))}
                           {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                              <tr className="group/row">
                                 <td className="py-10 font-black italic uppercase text-sm text-white/80 group-hover/row:text-white transition-colors">Standard Consultation Services</td>
                                 <td className="py-10 text-right font-black italic text-white/40">1</td>
                                 <td className="py-10 text-right font-black italic text-white/40">${Number(selectedInvoice.total_amount).toLocaleString()}</td>
                                 <td className="py-10 text-right font-black italic text-white text-xl">${Number(selectedInvoice.total_amount).toLocaleString()}</td>
                              </tr>
                           )}
                        </tbody>
                     </table>

                     <div className="flex justify-end pt-12 border-t-2 border-white/10 relative z-10">
                        <div className="w-80 space-y-6">
                           <div className="flex justify-between items-center text-white/20">
                              <span className="text-[10px] font-black uppercase tracking-widest">Base Amount</span>
                              <span className="text-sm font-black italic">${Number(selectedInvoice.total_amount).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-white/20 pb-6 border-b border-white/5">
                              <span className="text-[10px] font-black uppercase tracking-widest">Processing Fee</span>
                              <span className="text-sm font-black italic">$0.00</span>
                           </div>
                           <div className="flex justify-between items-center pt-4">
                              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#6c47ff]">Final Balance</span>
                              <span className="text-5xl font-black italic tracking-tighter text-white">${Number(selectedInvoice.total_amount).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-white text-black flex items-center justify-center">
                              <ShieldCheck className="h-6 w-6" />
                           </div>
                           <div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 block">Cryptography Verified</span>
                              <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest italic leading-none">Authentication ID: {selectedInvoice.id.substring(0, 18).toUpperCase()}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Authorization Signature</span>
                           <div className="h-px w-40 bg-white/10 ml-auto mb-2" />
                           <span className="text-[10px] font-bold italic text-white/40 uppercase">Accounts Department</span>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <FileText className="h-24 w-24 mb-6" />
                  <span className="text-xl font-black uppercase tracking-[0.5em] italic">Select Transaction</span>
               </div>
            )}
         </div>
      </div>
   );
}

function StatusBadge({ status }: { status: string }) {
   if (status === 'paid') return <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Paid</Badge>;
   if (status === 'open' || status === 'sent') return <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Pending</Badge>;
   return <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">{status}</Badge>;
}
