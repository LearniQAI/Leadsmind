'use client';

import React from 'react';
import { HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string;
  className?: string;
  icon?: 'info' | 'help';
  size?: number;
}

export function InfoTooltip({ 
  content, 
  className, 
  icon = 'info',
  size = 14 
}: InfoTooltipProps) {
  const Icon = icon === 'info' ? Info : HelpCircle;

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger render={
          <span 
            className={cn(
              "inline-flex items-center justify-center text-white/30 hover:text-white transition-colors focus:outline-none ml-1 cursor-help",
              className
            )}
          >
            <Icon size={size} />
            <span className="sr-only">Information</span>
          </span>
        } />
        <TooltipContent 
          side="top" 
          className="max-w-[250px] bg-[#1a1a24] border-white/10 text-white p-3 text-xs leading-relaxed shadow-xl rounded-xl"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
