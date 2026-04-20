'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopularSlotHighlighterProps {
  dayOfWeek: number;
  hour: number;
  popularSlots: { slot_day_of_week: number, slot_hour: number }[];
  className?: string;
}

export function PopularSlotHighlighter({ dayOfWeek, hour, popularSlots, className }: PopularSlotHighlighterProps) {
  const isPopular = popularSlots.some(s => s.slot_day_of_week === dayOfWeek && s.slot_hour === hour);

  if (!isPopular) return null;

  return (
    <div className={cn("absolute -top-2 -right-2 z-20 animate-bounce-subtle", className)}>
       <Badge className="bg-[#6c47ff] text-white text-[10px] font-black uppercase tracking-tighter border-none px-1.5 py-0 shadow-[0_0_15px_rgba(108,71,255,0.5)]">
         <Sparkles className="h-2 w-2 mr-1 fill-white" />
         Popular
       </Badge>
    </div>
  );
}
