'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Zap, ShieldQuestion, HelpCircle, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionLabel } from './BookingPrimitives';

interface BookingOutcome {
  id: string;
  label: string;
  description: string;
  duration_minutes: number;
  color?: string;
}

interface OutcomeSelectorProps {
  outcomes: BookingOutcome[];
  onSelect: (outcome: BookingOutcome) => void;
  selectedId?: string;
}

const ICON_MAP: Record<string, any> = {
  'demo': Sparkles,
  'help': HelpCircle,
  'support': ShieldQuestion,
  'upgrade': Zap,
  'default': Briefcase
};

export function OutcomeSelector({ outcomes, onSelect, selectedId }: OutcomeSelectorProps) {
  return (
    <div className="space-y-4">
      <SectionLabel 
        label="Step 1: Goal Selection" 
        title="What do you want to achieve?" 
        description="Your answer helps us route you to the right expert and prepare for our session."
      />

      <div className="grid grid-cols-1 gap-3">
        {outcomes.map((outcome) => {
          const lowerLabel = outcome.label.toLowerCase();
          const Icon = ICON_MAP[lowerLabel.includes('demo') ? 'demo' : 
                        lowerLabel.includes('help') ? 'help' : 
                        lowerLabel.includes('upgrade') ? 'upgrade' : 'default'];
          
          const isSelected = selectedId === outcome.id;

          return (
            <button
              key={outcome.id}
              onClick={() => onSelect(outcome)}
              className={cn(
                "group relative flex items-center justify-between p-6 rounded-[24px] border transition-all duration-500 text-left overflow-hidden",
                isSelected 
                  ? "bg-[#6c47ff]/10 border-[#6c47ff] shadow-[0_0_30px_rgba(108,71,255,0.2)]" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                  isSelected ? "bg-[#6c47ff] text-white" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex flex-col">
                  <span className={cn("text-lg font-bold tracking-tight transition-colors", isSelected ? "text-white" : "text-white/70")}>
                    {outcome.label}
                  </span>
                  <span className="text-sm text-white/30 font-medium">{outcome.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                 <Badge variant="outline" className={cn(
                   "border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                   isSelected ? "bg-[#6c47ff]/20 text-[#6c47ff]" : "bg-white/5 text-white/20"
                 )}>
                   {outcome.duration_minutes}m
                 </Badge>
                 <ArrowRight className={cn(
                   "h-5 w-5 transition-all duration-500",
                   isSelected ? "text-[#6c47ff] translate-x-0 opacity-100" : "text-white/10 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                 )} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
