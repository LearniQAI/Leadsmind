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
        "relative min-w-[240px] rounded-[2rem] border bg-[#12121e]/40 p-5 backdrop-blur-2xl transition-all duration-500 ease-out",
        selected
          ? "border-current ring-[12px] ring-current/10 shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_30px_rgba(108,71,255,0.15)] scale-[1.02]"
          : "border-white/5 shadow-xl hover:border-white/20"
      )}
      style={{ color: selected ? color : undefined }}
    >
      {/* Analytics Badge - Premium Floater */}
      {analytics && (
        <div className="absolute -top-4 -right-4 flex items-center gap-2.5 rounded-2xl bg-[#0b0b15] border border-white/10 px-4 py-2 shadow-2xl pointer-events-none group">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Total Hits</span>
            <span className="text-xs font-black text-white leading-none">{analytics.count}</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className={cn(
            "h-2 w-2 rounded-full", 
            analytics.status === 'active' ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" : "bg-white/10"
          )} />
        </div>
      )}

      {/* Decorative Glow */}
      <div 
        className="absolute -inset-px rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        style={{ 
          background: `radial-gradient(120px circle at 50% 0%, ${color}20, transparent 70%)` 
        }}
      />

      {/* Background shadow glow */}
      {selected && (
        <div 
          className="absolute inset-x-4 -bottom-4 h-8 bg-current opacity-20 blur-2xl rounded-full animate-pulse"
        />
      )}

      <div className="flex items-center gap-4">
        <div 
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 shadow-inner group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            color: color,
            border: `1px solid ${color}20`
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-[11px] font-black tracking-[0.1em] text-white uppercase opacity-90">{label}</h3>
          {sublabel && (
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em]">{sublabel}</p>
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
            className="!h-2 !w-2 !border-2 !border-white/10 !bg-[#0b0b10] hover:!border-white/30"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-2 !w-2 !border-2 !border-white/10 !bg-[#0b0b10] hover:!border-white/30"
          />
        </>
      )}
    </div>
  );
}
