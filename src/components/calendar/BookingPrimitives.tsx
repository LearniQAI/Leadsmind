import React from 'react';
import { cn } from '@/lib/utils';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  withGlow?: boolean;
  glowColor?: string;
}

export function GlassContainer({ 
  children, 
  className, 
  withGlow = true, 
  glowColor = '#6c47ff' 
}: GlassContainerProps) {
  return (
    <div className={cn(
      "bg-[#0b0b14] border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden group",
      className
    )}>
      {/* Top Gradient Glow Line */}
      {withGlow && (
        <div 
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" 
          style={{ backgroundImage: `linear-gradient(to right, transparent, ${glowColor}4D, transparent)` }}
        />
      )}
      
      {/* Subtle Bottom Refraction */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/[0.01] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface SectionLabelProps {
  label: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}

export function SectionLabel({ label, title, description, badge }: SectionLabelProps) {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase underline decoration-[#6c47ff]/30 underline-offset-8">
          {title}
        </h2>
        {badge}
      </div>
      {description && <p className="text-white/40 text-sm mt-3 leading-relaxed">{description}</p>}
    </div>
  );
}
