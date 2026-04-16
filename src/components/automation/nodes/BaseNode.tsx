"use client";

import { Handle, Position } from "reactflow";
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
        "relative min-w-[220px] rounded-xl border bg-[#0b0b15] p-4 transition-all duration-200",
        selected
          ? "border-[#6c47ff] shadow-[0_0_20px_rgba(108,71,255,0.1)] ring-1 ring-[#6c47ff]/50"
          : "border-white/5 shadow-md hover:border-white/10"
      )}
    >
      {/* Analytics Badge - Minimal */}
      {analytics && (
        <div className="absolute -top-3 -right-3 flex items-center gap-2 rounded-lg bg-[#1a1a24] border border-white/10 px-3 py-1.5 shadow-xl pointer-events-none">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-bold text-white/30 uppercase tracking-wider mb-0.5">Hits</span>
            <span className="text-xs font-bold text-white leading-none">{analytics.count}</span>
          </div>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full", 
            analytics.status === 'active' ? "bg-emerald-400" : "bg-white/10"
          )} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform"
          style={{ 
            background: color + '10',
            color: color,
            border: `1px solid ${color}20`
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-0">
          <h3 className="text-[10px] font-bold tracking-wider text-white uppercase">{label}</h3>
          {sublabel && (
            <p className="text-[9px] font-medium text-white/40 tracking-wide">{sublabel}</p>
          )}
        </div>
      </div>

      {children}

      {/* Handles */}
      {!hideDefaultHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="!h-1.5 !w-1.5 !border-none !bg-white/20 hover:!bg-white/40 !transition-colors"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-1.5 !w-1.5 !border-none !bg-white/20 hover:!bg-white/40 !transition-colors"
          />
        </>
      )}
    </div>
  );
}
