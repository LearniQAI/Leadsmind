'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
  data: any[]; // booking_slot_analytics data
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function BookingHeatmap({ data }: HeatmapProps) {
  // Map data to 7x24 matrix
  const matrix = Array(7).fill(0).map(() => Array(24).fill(0));
  
  data.forEach(item => {
    if (item.slot_day_of_week < 7 && item.slot_hour < 24) {
      matrix[item.slot_day_of_week][item.slot_hour] = item.total_bookings;
    }
  });

  const maxDensity = Math.max(...matrix.flat(), 1);

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[800px]">
        <div className="flex">
          {/* Hour Labels Column */}
          <div className="w-12 flex-shrink-0" />
          <div className="flex flex-1 justify-between mb-4 px-2">
            {HOURS.map(h => (
              <span key={h} className="text-[8px] font-black text-white/10 uppercase tracking-tighter w-full text-center">
                {h % 6 === 0 ? `${h}h` : ''}
              </span>
            ))}
          </div>
        </div>

        {DAYS.map((day, dIdx) => (
          <div key={day} className="flex items-center gap-2 mb-1">
             <span className="w-12 text-[10px] font-black text-white/20 uppercase tracking-widest italic">{day}</span>
             <div className="flex flex-1 gap-1">
                {HOURS.map((h) => {
                   const intensity = matrix[dIdx][h] / maxDensity;
                   const count = matrix[dIdx][h];
                   
                   return (
                     <TooltipProvider key={h}>
                        <Tooltip delayDuration={0}>
                           <TooltipTrigger asChild>
                              <div 
                                className={cn(
                                  "flex-1 h-6 rounded-md transition-all duration-300",
                                  count === 0 ? "bg-white/[0.02]" : "ring-1 ring-white/5"
                                )}
                                style={{ 
                                  backgroundColor: count > 0 ? `rgba(108, 71, 255, ${0.1 + intensity * 0.9})` : undefined,
                                  boxShadow: count > 0 ? `0 0 10px rgba(108, 71, 255, ${intensity * 0.3})` : 'none'
                                }}
                              />
                           </TooltipTrigger>
                           <TooltipContent className="bg-black border border-white/10 text-[10px] font-bold py-1 px-2">
                              {day} at {h}:00 — {count} Bookings
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                   )
                })}
             </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5">
           <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Quiet</span>
           <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 1].map(v => (
                 <div key={v} className="h-2 w-4 rounded-sm" style={{ backgroundColor: `rgba(108, 71, 255, ${v})` }} />
              ))}
           </div>
           <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest">Peak Intensity</span>
        </div>
      </div>
    </div>
  );
}
