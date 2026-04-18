"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function RouteNode({ data, selected }: any) {
  const branches = data.branches || [];

  return (
    <BaseNode
      label={data.label || "Router"}
      icon={GitBranch}
      sublabel={`${branches.length} Branches`}
      color="#f59e0b" // Amber
      selected={selected}
      data={data}
      hideDefaultHandles={true}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !rounded-full !border-white/20 !bg-[#1a1a24] !border-2 !-top-1 px-0 shadow-lg"
      />
      
      {/* Branch Handles */}
      <div className="border-t border-white/5 bg-white/[0.02] p-2 flex justify-around relative min-h-[40px]">
        {branches.map((branch: any) => (
          <div key={branch.name} className="relative flex flex-col items-center flex-1">
            <span className="text-[7px] font-bold text-white/30 uppercase mb-5 truncate w-full text-center px-1">
              {branch.name}
            </span>
            <Handle
              type="source"
              position={Position.Bottom}
              id={branch.name}
              className="!h-2 !w-2 !bg-[#f59e0b] !border-none !-bottom-1 hover:!scale-150 !transition-all"
            />
          </div>
        ))}
        
        {/* Default Handle */}
        <div className="relative flex flex-col items-center flex-1">
          <span className="text-[7px] font-bold text-white/30 uppercase mb-5">Default</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="default"
            className="!h-2 !w-2 !bg-white/20 !border-none !-bottom-1 hover:!scale-150 !transition-all"
          />
        </div>
      </div>
    </BaseNode>
  );
}
