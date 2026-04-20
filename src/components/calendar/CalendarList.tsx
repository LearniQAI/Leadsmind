'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Link as LinkIcon, Settings, Copy, ExternalLink, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Calendar {
  id: string;
  name: string;
  slug: string;
  slot_duration: number;
}

interface CalendarListProps {
  calendars: Calendar[];
}

export function CalendarList({ calendars }: CalendarListProps) {
  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Booking link copied to clipboard');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {/* Create New Calendar Card */}
      <button className="flex flex-col items-center justify-center p-8 rounded-[32px] border-2 border-dashed border-white/5 hover:border-[#6c47ff]/50 bg-white/[0.02] hover:bg-[#6c47ff]/5 transition-all duration-500 group">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#6c47ff] transition-all duration-500">
           <Plus className="h-6 w-6 text-white" />
        </div>
        <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Create New Calendar</span>
      </button>

      {calendars.map((calendar) => (
        <Card key={calendar.id} className="bg-[#0b0b14] border-white/5 rounded-[32px] overflow-hidden group hover:border-white/10 transition-all duration-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
               <div className="h-10 w-10 rounded-xl bg-linear-to-br from-[#6c47ff]/20 to-[#8b5cf6]/20 flex items-center justify-center border border-white/5">
                 <Globe className="h-5 w-5 text-[#6c47ff]" />
               </div>
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/20 hover:text-white" onClick={() => copyLink(calendar.slug)}>
                   <Copy className="h-3.5 w-3.5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/20 hover:text-white">
                   <Settings className="h-3.5 w-3.5" />
                 </Button>
               </div>
            </div>
            <CardTitle className="text-xl font-bold mt-4 text-white uppercase italic tracking-tighter">{calendar.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-white/5 border-white/5 text-white/40 text-[9px] font-bold uppercase tracking-widest">{calendar.slot_duration} Min Session</Badge>
              <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">Active Link</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="pt-4 border-t border-white/5 mt-2 flex items-center justify-between">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-6 w-6 rounded-full bg-white/10 border border-[#0b0b14] flex items-center justify-center text-[8px] font-bold text-white/40 overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${calendar.id}${i}`} alt="user" />
                   </div>
                 ))}
                 <div className="pl-4 text-[10px] font-bold text-white/20 flex items-center uppercase tracking-widest">3 Availabilities</div>
               </div>
               <Button className="bg-white/5 hover:bg-white/10 text-white rounded-xl h-9 px-4 gap-2 text-xs font-bold border border-white/5">
                  View Page
                  <ExternalLink className="h-3 w-3" />
               </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
