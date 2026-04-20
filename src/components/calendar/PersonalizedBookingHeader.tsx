'use client';

import React from 'react';
import { format } from 'date-fns';
import { Sparkles, CalendarDays } from 'lucide-react';

interface PersonalizedBookingHeaderProps {
  contactName?: string | null;
  hostName: string;
  lastSessionDate?: string | null;
}

export function PersonalizedBookingHeader({ contactName, hostName, lastSessionDate }: PersonalizedBookingHeaderProps) {
  return (
    <div className="text-center space-y-4 mb-12">
       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6c47ff]/5 border border-[#6c47ff]/10 mb-2">
         <Sparkles className="h-3.5 w-3.5 text-[#6c47ff] fill-[#6c47ff]" />
         <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.2em]">
           {contactName ? `Personalized for ${contactName}` : 'Booking Intelligence Active'}
         </span>
       </div>

       <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white italic uppercase leading-none">
         {contactName ? (
           <>
             Hi <span className="text-[#6c47ff]">{contactName}</span>, <br className="hidden sm:block" /> 
             book a time with {hostName}
           </>
         ) : (
           `Schedule a meeting with ${hostName}`
         )}
       </h1>

       {lastSessionDate && (
         <div className="flex items-center justify-center gap-2 text-white/40 mt-4">
           <CalendarDays className="h-4 w-4 text-[#6c47ff]" />
           <p className="text-sm font-medium italic">
             Your last session was {format(new Date(lastSessionDate), 'MMMM do')}. This is your follow-up.
           </p>
         </div>
       )}
       
       <div className="w-12 h-1 bg-linear-to-r from-transparent via-[#6c47ff] to-transparent mx-auto mt-8 opacity-50" />
    </div>
  );
}
