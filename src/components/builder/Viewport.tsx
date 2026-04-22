"use client";

import React, { useState } from 'react';
import { useEditor, Frame, Element } from '@craftjs/core';
import { Monitor, Tablet, Smartphone, Scale } from 'lucide-react';
import { Container } from './user/Container';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const Viewport = ({ children }: { children?: React.ReactNode }) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const { connectors, actions } = useEditor();

  const getWidth = () => {
    switch(device) {
        case 'mobile': return '375px';
        case 'tablet': return '768px';
        default: return '100%';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden relative">
      {/* Device Toolbar */}
      <div className="h-14 bg-background border-b flex items-center justify-center gap-4 px-4 shrink-0 z-10 shadow-sm">
        <div className="flex bg-muted p-1 rounded-lg">
            <button 
                onClick={() => setDevice('desktop')}
                className={cn(
                    "p-2 rounded-md transition-all",
                    device === 'desktop' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setDevice('tablet')}
                className={cn(
                    "p-2 rounded-md transition-all",
                    device === 'tablet' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Tablet className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setDevice('mobile')}
                className={cn(
                    "p-2 rounded-md transition-all",
                    device === 'mobile' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Smartphone className="w-4 h-4" />
            </button>
        </div>
        
        <div className="absolute right-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Scale className="w-3 h-3" />
                {device === 'desktop' ? 'Fluid' : getWidth()}
            </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center items-start transition-all duration-300 scroll-smooth">
        <div 
          className={cn(
            "bg-white shadow-2xl transition-all duration-300 origin-top min-h-full",
            device === 'mobile' && "rounded-[32px] border-[8px] border-slate-900 overflow-hidden",
            device === 'tablet' && "rounded-xl border-4 border-slate-800"
          )}
          style={{ width: getWidth() }}
        >
          <div 
            className="w-full h-full"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
