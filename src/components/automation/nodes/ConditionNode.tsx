"use client";

import { Handle, Position } from "reactflow";
import { GitBranch } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ConditionNode({ data, selected }: any) {
  return (
    <BaseNode
      label={data.label || "If / Else"}
      icon={GitBranch}
      sublabel={data.condition || "Check Condition"}
      color="#f59e0b" // Amber
      selected={selected}
      data={data}
      hideDefaultHandles
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-none !bg-white/20 hover:!bg-white/40 !transition-colors"
      />

      {/* Output Handles */}
      <div className="mt-4 flex justify-between items-center px-2 pb-1">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">True</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!relative !bg-emerald-500 !h-1.5 !w-1.5 !border-none !left-0 !transform-none hover:scale-125 transition-transform"
          />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">False</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!relative !bg-rose-500 !h-1.5 !w-1.5 !border-none !left-0 !transform-none hover:scale-125 transition-transform"
          />
        </div>
      </div>
    </BaseNode>
  );
}
