'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  History, 
  Ticket,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';
import { GlassContainer, SectionLabel } from './BookingPrimitives';
import { toast } from 'sonner';
import { createPackage } from '@/app/actions/calendar';

export function CreditPackageEditor({ calendarId }: { calendarId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(5);
  const [price, setPrice] = useState(99);

  const handleCreate = async () => {
    const res = await createPackage({ name, totalCredits: credits, price });
    if (res.success) {
      toast.success('Package created successfully');
      setIsAdding(false);
    } else {
      toast.error('Failed to create package');
    }
  };

  return (
    <div className="mt-12 space-y-8">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Badge className="bg-[#fdab3d]/10 text-[#fdab3d] border-none text-[10px] font-black uppercase tracking-widest mb-2">Revenue Engine</Badge>
           <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight">Session Packages</h2>
           <p className="text-white/40 text-sm italic">Sell credits and manage prepaid session bundles.</p>
        </div>
        <Button 
          id="add-package-btn"
          onClick={() => setIsAdding(true)}
          className="bg-[#fdab3d] hover:bg-[#e69a31] text-white rounded-xl gap-2 font-black italic uppercase text-xs h-12 px-8 shadow-xl shadow-[#fdab3d]/20"
        >
          <Plus className="h-4 w-4" />
          New Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {isAdding && (
           <GlassContainer className="p-8 border-[#fdab3d]/30 bg-[#fdab3d]/5 animate-in zoom-in duration-300">
              <div className="space-y-4">
                 <div className="h-12 w-12 rounded-2xl bg-[#fdab3d] flex items-center justify-center text-white mb-4">
                    <Package className="h-6 w-6" />
                 </div>
                 <Input 
                   id="pkg-name"
                   placeholder="Package name (e.g. 5 Sessions)" 
                   className="bg-black/20 border-white/5 text-white"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <Input 
                      id="pkg-credits"
                      type="number" 
                      placeholder="Credits" 
                      className="bg-black/20 border-white/5 text-whiteText"
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                    />
                    <Input 
                      id="pkg-price"
                      type="number" 
                      placeholder="Price" 
                      className="bg-black/20 border-white/5 text-white"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                 </div>
                 <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreate} className="flex-1 bg-[#fdab3d] text-white font-bold rounded-xl">Create</Button>
                    <Button onClick={() => setIsAdding(false)} variant="ghost" className="text-white/40">Cancel</Button>
                 </div>
              </div>
           </GlassContainer>
         )}

         {/* Example Package (Preview) */}
         <GlassContainer className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <Ticket className="h-5 w-5 text-[#fdab3d]" />
                </div>
                <Badge variant="outline" className="bg-[#fdab3d]/10 text-[#fdab3d] border-none text-[8px] font-black tracking-widest">ACTIVE</Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-1 uppercase italic tracking-tighter">Growth Starter</h3>
            <p className="text-xs text-white/30 italic mb-6 leading-relaxed">5 Sessions with any team member. Priority booking access included.</p>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Credits</span>
                  <span className="text-sm font-black text-white italic">05</span>
               </div>
               <div className="flex justify-between items-center bg-[#fdab3d]/5 p-3 rounded-2xl border border-[#fdab3d]/10">
                  <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-widest">Package Price</span>
                  <span className="text-sm font-black text-white italic">$99.00</span>
               </div>
            </div>
         </GlassContainer>

         {/* Credit Monitor Item */}
         <GlassContainer className="p-8 group">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-10 w-10 rounded-full border-2 border-[#fdab3d]/30 p-0.5">
                  <div className="h-full w-full rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">SC</div>
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase italic">Sarah Connor</h4>
                  <div className="flex items-center gap-2">
                     <div className="h-1 w-1 rounded-full bg-emerald-500" />
                     <p className="text-[9px] text-white/20 font-medium uppercase tracking-[0.2em]">Active Balance</p>
                  </div>
               </div>
            </div>
            
            <div className="flex items-end justify-between">
               <div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Remaining</span>
                  <span className="text-4xl font-black text-[#fdab3d] italic leading-none">03</span>
               </div>
               <Button id="view-ledger-btn" size="sm" variant="ghost" className="text-white/10 hover:text-white rounded-xl h-8 px-2 group-hover:bg-white/5">
                  <History className="h-4 w-4 mr-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Ledger</span>
               </Button>
            </div>
         </GlassContainer>
      </div>
    </div>
  );
}
