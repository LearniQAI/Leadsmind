"use client";

import { Handle, Position } from "@xyflow/react";
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
        className="!h-2 !w-2 !border-2 !border-white/10 !bg-[#0b0b10] hover:!border-white/30"
      />

      {/* Output Handles */}
      <div className="mt-4 flex justify-between items-center px-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">True</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!relative !bg-emerald-500 !border-white/10 !left-0 !transform-none"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">False</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!relative !bg-rose-500 !border-white/10 !left-0 !transform-none"
          />
        </div>
      </div>
    </BaseNode>
  );
}
