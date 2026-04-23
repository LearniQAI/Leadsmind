'use client';

import React, { useState } from 'react';
import {
   Search,
   Plus,
   Download,
   MoreHorizontal,
   Calendar,
   FileSignature,
   ChevronRight,
   X,
   CheckCircle2,
   AlertTriangle,
   Clock,
   ArrowRight,
   FileText,
   Send,
   Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { convertToInvoice } from '@/app/actions/finance';
import { useRouter } from 'next/navigation';

interface ProposalMasterDetailProps {
   proposals: any[];
}

export function ProposalMasterDetail({ proposals }: ProposalMasterDetailProps) {
   const [selectedId, setSelectedId] = useState<string | null>(proposals[0]?.id || null);
   const [search, setSearch] = useState('');
   const [isConverting, setIsConverting] = useState(false);
   const router = useRouter();

   const selectedProposal = proposals.find(p => p.id === selectedId);
   const filteredProposals = proposals.filter(p =>
      p.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.contact?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.contact?.last_name?.toLowerCase().includes(search.toLowerCase())
   );

   const handleConvert = async () => {
      if (!selectedId) return;
      setIsConverting(true);
      try {
         const result = await convertToInvoice(selectedId);
         if (result.success) {
            toast.success('Proposal successfully converted to Invoice!');
            router.push(`/invoices/${result.data.id}`);
         } else {
            toast.error(result.error || 'Conversion failed');
         }
      } catch (error) {
         toast.error('An unexpected error occurred during conversion');
      } finally {
         setIsConverting(false);
      }
   };

   return (
      <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-140px)] -m-6 overflow-hidden bg-[#050508]">
         {/* Left Sidebar List */}
         <div className={cn(
            "w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-[#0b0b14]/50",
            selectedId && "hidden lg:flex"
         )}>
            <div className="p-6 space-y-4 border-b border-white/5">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Proposal <span className="text-white/20">Studio</span></h2>
                  <Button size="icon" className="h-8 w-8 rounded-lg bg-[#6c47ff] hover:bg-[#5b3ce0]">
                     <Plus className="h-4 w-4" />
                  </Button>
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search proposals..."
                     className="pl-10 h-10 bg-white/5 border-white/5 rounded-xl text-xs font-bold"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-1">
               {filteredProposals.map((prop) => (
                  <button
                     key={prop.id}
                     onClick={() => setSelectedId(prop.id)}
                     className={cn(
                        "w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        selectedId === prop.id
                           ? "bg-[#6c47ff]/10 border border-[#6c47ff]/20"
                           : "hover:bg-white/[0.02] border border-transparent"
                     )}
                  >
                     {selectedId === prop.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c47ff]" />
                     )}
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff]">{prop.quote_number}</span>
                        <span className="text-sm font-black text-white italic tracking-tight">${Number(prop.total_amount).toLocaleString()}</span>
                     </div>
                     <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">
                        {prop.contact ? `${prop.contact.first_name} ${prop.contact.last_name}` : 'Unknown Prospect'}
                     </h4>
                     <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium">
                           <Calendar className="h-3 w-3" />
                           {prop.valid_until ? format(new Date(prop.valid_until), 'dd MMM y') : format(new Date(prop.created_at), 'dd MMM y')}
                        </div>
                        <StatusBadge status={prop.status} />
                     </div>
                  </button>
               ))}
               {filteredProposals.length === 0 && (
                  <div className="p-8 text-center">
                     <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No proposals found</p>
                  </div>
               )}
            </div>
         </div>

         {/* Right Content Area */}
         <div className={cn(
            "flex-1 bg-[#050508] overflow-y-auto scrollbar-none p-4 md:p-12",
            !selectedId && "hidden lg:block"
         )}>
            {selectedProposal ? (
               <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0b0b14] p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 shadow-2xl gap-4">
                     <div className="flex items-center gap-4">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="lg:hidden text-white/40"
                           onClick={() => setSelectedId(null)}
                        >
                           <X className="h-5 w-5" />
                        </Button>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-white/5 flex items-center justify-center bg-white/[0.02]">
                           <FileSignature className="h-5 w-5 md:h-6 md:w-6 text-white/20" />
                        </div>
                        <div className="overflow-hidden">
                           <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white truncate">Quote Detail</h3>
                           <p className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] truncate">{selectedProposal.quote_number} • Valid until {selectedProposal.valid_until ? format(new Date(selectedProposal.valid_until), 'MMM dd, y') : 'N/A'}</p>
                        </div>
                     </div>
                     <div className="flex gap-2 w-full md:w-auto">
                        {selectedProposal.status === 'accepted' && (
                           <Button
                              onClick={handleConvert}
                              disabled={isConverting}
                              className="flex-1 md:flex-none h-10 md:h-12 px-6 rounded-xl bg-[#6c47ff] text-white font-black italic uppercase text-[10px] md:text-xs gap-2 hover:bg-[#5b3ce0]"
                           >
                              <ArrowRight className="h-4 w-4" />
                              {isConverting ? 'Processing...' : 'Generate Invoice'}
                           </Button>
                        )}
                        <Button variant="outline" className="h-10 md:h-12 px-6 rounded-xl bg-white/5 border-white/10 text-white font-black italic uppercase text-[10px] md:text-xs gap-2 hover:bg-white/10">
                           <Download className="h-4 w-4" />
                           Preview
                        </Button>
                        <Button variant="outline" className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-xl bg-white/5 border-white/10 text-white/40 hover:text-white">
                           <MoreHorizontal className="h-5 w-5 mx-auto" />
                        </Button>
                     </div>
                  </div>

                  <div className="bg-[#0b0b14] p-6 md:p-16 rounded-[32px] md:rounded-[48px] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c47ff]/5 blur-[120px] rounded-full pointer-events-none" />

                     <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 md:mb-24 relative z-10">
                        <div>
                           <div className="h-10 w-40 md:h-12 md:w-48 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center font-black italic mb-6 tracking-tighter text-sm md:text-base">LEADSMIND</div>
                           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 space-y-2">
                              <p>Boutique Service Proposal</p>
                              <p>Silicon Valley, CA 94043</p>
                              <p>contact@leadsmind.io</p>
                           </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                           <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none text-balance">Estimate</h1>
                           <div className="flex flex-col items-start md:items-end gap-1">
                              <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.3em]">{selectedProposal.quote_number}</span>
                              <StatusBadge status={selectedProposal.status} />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mb-16 md:mb-24 relative z-10">
                        <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/[0.02] border border-white/5 overflow-hidden">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff] mb-4 block">Prepared For</span>
                           <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white mb-2 tracking-tighter truncate">
                              {selectedProposal.contact?.first_name} {selectedProposal.contact?.last_name}
                           </h2>
                           <p className="text-xs font-bold text-white/40 leading-relaxed break-all">{selectedProposal.contact?.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-8 pt-0 md:pt-6">
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Quote Date</span>
                              <span className="text-xs md:text-sm font-black italic text-white whitespace-nowrap">{format(new Date(selectedProposal.created_at), 'dd MMM yyyy')}</span>
                           </div>
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Validity Limit</span>
                              <span className="text-xs md:text-sm font-black italic text-[#6c47ff] whitespace-nowrap">{selectedProposal.valid_until ? format(new Date(selectedProposal.valid_until), 'dd MMM y') : 'N/A'}</span>
                           </div>
                        </div>
                     </div>

                     <div className="overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
                        <table className="w-full mb-16 md:mb-24 text-left relative z-10 min-w-[500px]">
                           <thead>
                              <tr className="border-b border-white/5">
                                 <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Service Item</th>
                                 <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Qty</th>
                                 <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Rate</th>
                                 <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {selectedProposal.items?.map((item: any, idx: number) => (
                                 <tr key={idx} className="group/row">
                                    <td className="py-8 font-black italic uppercase text-sm text-white/80 group-hover/row:text-white transition-colors">{item.description}</td>
                                    <td className="py-8 text-right font-black italic text-white/40">{item.quantity || 1}</td>
                                    <td className="py-8 text-right font-black italic text-white/40">${Number(item.unit_amount || 0).toLocaleString()}</td>
                                    <td className="py-8 text-right font-black italic text-white text-lg">${(Number(item.quantity || 1) * Number(item.unit_amount || 0)).toLocaleString()}</td>
                                 </tr>
                              ))}
                              {(!selectedProposal.items || selectedProposal.items.length === 0) && (
                                 <tr className="group/row">
                                    <td className="py-10 font-black italic uppercase text-sm text-white/80 group-hover/row:text-white transition-colors">Strategic Services Package</td>
                                    <td className="py-10 text-right font-black italic text-white/40">1</td>
                                    <td className="py-10 text-right font-black italic text-white/40">${Number(selectedProposal.total_amount).toLocaleString()}</td>
                                    <td className="py-10 text-right font-black italic text-white text-xl">${Number(selectedProposal.total_amount).toLocaleString()}</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>

                     <div className="flex justify-end pt-12 border-t-2 border-white/10 relative z-10">
                        <div className="w-full md:w-80 space-y-6">
                           <div className="flex justify-between items-center text-white/20">
                              <span className="text-[10px] font-black uppercase tracking-widest">Base Estimate</span>
                              <span className="text-xs md:text-sm font-black italic">${Number(selectedProposal.total_amount).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-white/20 pb-6 border-b border-white/5">
                               <span className="text-[10px] font-black uppercase tracking-widest">Estimated Taxes</span>
                               <span className="text-xs md:text-sm font-black italic">$0.00</span>
                            </div>
                           <div className="flex justify-between items-center pt-4">
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#6c47ff]">Project Total</span>
                              <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">${Number(selectedProposal.total_amount).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-16 md:mt-24 p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6c47ff] block mb-4">Internal Notes & Terms</span>
                        <p className="text-xs font-medium text-white/40 leading-relaxed italic">
                           {selectedProposal.notes || "This proposal is non-binding and subject to final review. Acceptance of this estimate constitutes a move to the invoicing phase."}
                        </p>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <FileSignature className="h-24 w-24 mb-6" />
                  <span className="text-xl font-black uppercase tracking-[0.5em] italic">Select Proposal</span>
               </div>
            )}
         </div>
      </div>
   );
}

function StatusBadge({ status }: { status: string }) {
   if (status === 'accepted') return <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Accepted</Badge>;
   if (status === 'converted') return <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Converted</Badge>;
   if (status === 'sent') return <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Sent</Badge>;
   if (status === 'declined') return <Badge className="bg-rose-500/10 text-rose-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">Declined</Badge>;
   return <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">{status}</Badge>;
}
