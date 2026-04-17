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
        "relative min-w-[240px] rounded-2xl border bg-[#0d0d1a]/80 backdrop-blur-xl p-0 transition-all duration-300 group overflow-hidden",
        selected
          ? "border-[#6c47ff] shadow-[0_0_30px_rgba(108,71,255,0.2)] ring-1 ring-[#6c47ff]/50"
          : "border-white/10 shadow-lg hover:border-white/20 hover:bg-[#111122]"
      )}
    >
      {/* Category Accent Bar */}
      <div 
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }}
      />

      <div className="p-4 flex items-center gap-4">
        {/* Node Icon */}
        <div 
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 shadow-inner"
          style={{ 
            background: `radial-gradient(circle at center, ${color}30, ${color}10)`,
            color: color,
            border: `1px solid ${color}30`
          }}
        >
          <Icon className="h-5 w-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[11px] font-black tracking-tighter text-white uppercase truncate">{label}</h3>
            {analytics && (
               <div className="flex items-center gap-1.5 h-4 px-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className={cn("h-1 w-1 rounded-full animate-pulse", analytics.count > 0 ? "bg-emerald-400" : "bg-white/10")} />
                  <span className="text-[8px] font-bold text-white/40">{analytics.count}</span>
               </div>
            )}
          </div>
          {sublabel && (
            <p className="text-[10px] font-medium text-white/30 tracking-wide truncate">{sublabel}</p>
          )}
        </div>
      </div>

      {/* Connection Indicator Glows */}
      <div className="absolute top-1/2 -left-1 w-2 h-8 -translate-y-1/2 bg-white/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-1/2 -right-1 w-2 h-8 -translate-y-1/2 bg-white/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />

      {children}

      {/* Handles */}
      {!hideDefaultHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="!h-3 !w-12 !rounded-full !border-white/10 !bg-[#1a1a24] hover:!bg-[#2a2a3a] !border !transition-all hover:!scale-110 !-top-1.5 shadow-lg"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-3 !w-12 !rounded-full !border-white/10 !bg-[#1a1a24] hover:!bg-[#2a2a3a] !border !transition-all hover:!scale-110 !-bottom-1.5 shadow-lg flex items-center justify-center after:content-[''] after:w-1.5 after:h-1.5 after:bg-white/20 after:rounded-full"
          />
        </>
      )}
    </div>
  );
}
