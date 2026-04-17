"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ConditionNode({ data, selected }: any) {
  return (
    <BaseNode
      label={data.label || "Branch (If/Else)"}
      icon={GitBranch}
      sublabel={data.field ? `If ${data.field} ${data.operator}...` : "Split logic path"}
      color="#f59e0b" // Amber
      selected={selected}
      data={data}
      hideDefaultHandles
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !rounded-full !border-white/20 !bg-[#1a1a24] !border-2 !-top-1 px-0 shadow-lg"
      />

      {/* Output Handles */}
      <div className="flex w-full items-center justify-between px-6 pb-5 pt-2">
        <div className="flex flex-col items-center gap-2 group/true">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
             <div className="w-1 h-1 rounded-full bg-emerald-500" />
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">YES</span>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!relative !bg-emerald-500 !h-2.5 !w-2.5 !border-2 !border-[#0d0d1a] !left-0 !transform-none hover:!scale-150 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
        </div>
        
        <div className="flex flex-col items-center gap-2 group/false">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
             <div className="w-1 h-1 rounded-full bg-rose-500" />
             <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">NO</span>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!relative !bg-rose-500 !h-2.5 !w-2.5 !border-2 !border-[#0d0d1a] !left-0 !transform-none hover:!scale-150 transition-all shadow-[0_0_10px_rgba(244,63,94,0.3)]"
          />
        </div>
      </div>
    </BaseNode>
  );
}
