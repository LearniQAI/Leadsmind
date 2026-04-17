"use client";

import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BaseNodeProps {
  label: string;
  icon: LucideIcon;
  sublabel?: string;
  color?: string;
  selected?: boolean;
  data?: any;
  children?: React.ReactNode;
  hideDefaultHandles?: boolean;
}

export function BaseNode({ 
  label, 
  icon: Icon, 
  sublabel, 
  color = "#6c47ff", 
  selected,
  data,
  children,
  hideDefaultHandles = false
}: BaseNodeProps) {
  const analytics = data?.analytics;

  return (
    <div
      className={cn(
        "relative min-w-[280px] rounded-[24px] border bg-[#0d0d1a]/80 backdrop-blur-2xl p-0 transition-all duration-500 group overflow-hidden",
        selected
          ? "border-primary shadow-[0_0_40px_rgba(108,71,255,0.25)] ring-1 ring-primary/50 -translate-y-1"
          : "border-white/5 shadow-2xl hover:border-white/20 hover:bg-[#111122]/90"
      )}
    >
      {/* Configuration Status Indicator */}
      {(!data || Object.keys(data).length <= 2) && label !== 'Trigger' && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
           <div className="w-1 h-1 rounded-full bg-amber-500" />
           <span className="text-[7px] font-bold text-amber-500 uppercase tracking-tighter">Setup Required</span>
        </div>
      )}

      {/* Node Content */}
      <div className="p-5 flex items-center gap-5">
        {/* Node Icon Container */}
        <div 
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-700 group-hover:rotate-[10deg] shadow-inner relative"
          style={{ 
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            color: color,
            border: `1px solid ${color}20`
          }}
        >
          <Icon className="h-6 w-6 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" />
          <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[12px] font-bold tracking-tight text-white/90 truncate capitalize">{label}</h3>
            {analytics && (
               <div className="flex items-center gap-1.5 h-4 px-2 rounded-full bg-white/5 border border-white/10">
                  <div className={cn("h-1 w-1 rounded-full", analytics.count > 0 ? "bg-emerald-400" : "bg-white/10")} />
                  <span className="text-[9px] font-bold text-white/50">{analytics.count}</span>
               </div>
            )}
          </div>
          <p className="text-[10px] font-medium text-white/30 tracking-tight line-clamp-1 italic">
            {sublabel || `Click to configure ${label.toLowerCase()}`}
          </p>
        </div>
      </div>

      {children}

      {/* Handles - Vertical Flow Only (GHL Style) */}
      {!hideDefaultHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="!h-2.5 !w-2.5 !rounded-full !border-white/20 !bg-[#1a1a24] !border-2 !-top-1 px-0 shadow-lg"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-2.5 !w-2.5 !rounded-full !border-white/20 !bg-[#1a1a24] !border-2 !-bottom-1 px-0 shadow-lg hover:!scale-150 !transition-all"
          />
        </>
      )}
    </div>
  );
}
