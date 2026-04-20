'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Timer, UserPlus, ArrowRight, ShieldCheck, Mail, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  position: number;
  contact_name: string;
  contact_email: string;
  offered_at: string | null;
  offer_expires_at: string | null;
  confirmed: boolean;
}

export default function WaitlistManagerPage() {
  const [activeSession, setActiveSession] = useState({
      id: 'demo-session',
      title: 'Strategy Masterclass (Group)',
      max: 10,
      current: 10,
      isFull: true
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    { id: '1', position: 1, contact_name: 'Alex Rivera', contact_email: 'alex@example.com', offered_at: null, offer_expires_at: null, confirmed: false },
    { id: '2', position: 2, contact_name: 'Jordan Smith', contact_email: 'jordan@example.com', offered_at: null, offer_expires_at: null, confirmed: false },
    { id: '3', position: 3, contact_name: 'Sarah Chen', contact_email: 'sarah@example.com', offered_at: null, offer_expires_at: null, confirmed: false }
  ]);

  const handleManualOffer = (id: string) => {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, offered_at: new Date().toISOString(), offer_expires_at: expires } : w));
    toast.success('Waitlist offer sent via SMS & Email');
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
         <div className="flex items-center gap-2 mb-1">
           <div className="h-5 w-5 rounded-md bg-[#fdab3d]/10 flex items-center justify-center border border-[#fdab3d]/20">
              <Users className="h-3 w-3 text-[#fdab3d]" />
           </div>
           <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-[0.2em]">Group Session Management</span>
         </div>
         <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">Waitlist <span className="text-white/20">&</span> Availability</h1>
         <p className="text-white/40 text-sm font-medium mt-1">Real-time attendee promotion for group sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Session Stats */}
        <div className="md:col-span-1 space-y-6">
           <Card className="bg-[#0b0b14] border-white/5 rounded-[32px] overflow-hidden">
             <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-white uppercase italic tracking-wider">Active Session</CardTitle>
                <CardDescription className="text-white/30 text-xs">Capacity Watch</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Attendance</span>
                      <span className="text-2xl font-black text-white italic">{activeSession.current}/{activeSession.max}</span>
                   </div>
                   <Badge className={cn(
                     "px-3 py-1 rounded-lg border-none text-[10px] font-black uppercase tracking-widest",
                     activeSession.isFull ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                   )}>
                     {activeSession.isFull ? 'Waitlist Active' : 'Spots Open'}
                   </Badge>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-white/40">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#6c47ff]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Sync Enabled</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/40">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#fdab3d]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Automatic Promotion: ON</span>
                   </div>
                </div>
             </CardContent>
           </Card>

           <div className="p-8 rounded-[32px] bg-linear-to-br from-[#6c47ff]/5 to-transparent border border-[#6c47ff]/10">
              <ShieldCheck className="h-8 w-8 text-[#6c47ff] mb-4" />
              <h4 className="text-sm font-bold text-white mb-2 italic uppercase">Concurrency Protection</h4>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Our "First-Commit" logic ensures that even if 100 people click simultaneously, only the fastest wins the spot. The rest are auto-routed to position #1, #2...
              </p>
           </div>
        </div>

        {/* Waitlist Table */}
        <div className="md:col-span-2">
           <Card className="bg-[#0b0b14] border-white/5 rounded-[32px] overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <div>
                   <CardTitle className="text-lg font-bold text-white uppercase italic tracking-wider">Waitlist Queue</CardTitle>
                   <CardDescription className="text-white/30 text-xs">Sequential promotion queue</CardDescription>
                </div>
                <Badge variant="outline" className="bg-[#6c47ff]/5 border-[#6c47ff]/20 text-[#6c47ff]">{waitlist.length} People Waiting</Badge>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5">
                       <tr>
                         <th className="px-6 py-4">Pos</th>
                         <th className="py-4">Contact</th>
                         <th className="py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {waitlist.map((entry) => (
                         <tr key={entry.id} className="group hover:bg-white/[0.01] transition-colors">
                           <td className="px-6 py-6 border-r border-white/5">
                              <span className="text-xl font-black text-white italic">#{entry.position}</span>
                           </td>
                           <td className="py-6 px-4">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-white tracking-tight">{entry.contact_name}</span>
                                 <span className="text-[11px] text-white/30">{entry.contact_email}</span>
                              </div>
                           </td>
                           <td className="py-6">
                              {entry.offered_at ? (
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex items-center gap-1.5">
                                      <Timer className="h-3 w-3 text-[#fdab3d] animate-pulse" />
                                      <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-tighter">Offer Sent</span>
                                   </div>
                                   <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest tabular-nums">
                                      Expires in 01h 42m
                                   </div>
                                </div>
                              ) : (
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Waiting</span>
                              )}
                           </td>
                           <td className="px-6 py-6 text-right">
                              {!entry.offered_at && (
                                <Button 
                                  id={`offer-spot-btn-${entry.id}`}
                                  onClick={() => handleManualOffer(entry.id)}
                                  className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white hover:bg-[#6c47ff] hover:border-[#6c47ff] transition-all group/btn"
                                >
                                   Offer Spot
                                   <Send className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                              )}
                              {entry.offered_at && (
                                <div className="flex items-center justify-end gap-2 text-[#6c47ff]">
                                   <span className="text-[10px] font-black uppercase italic tracking-widest">Active Offer</span>
                                   <ArrowRight className="h-3 w-3" />
                                </div>
                              )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
