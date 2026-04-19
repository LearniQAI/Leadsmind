import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCompare, Trophy } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { cn } from '@/lib/utils';

export const SplitNode = memo(({ data, selected }: any) => {
  const winnerVariant = data.winner_variant;
  const isWinnerDeclared = !!winnerVariant;

  return (
    <BaseNode 
      data={data} 
      selected={selected}
      label={data.label || "A/B Split Test"}
      icon={GitCompare}
      color="#f43f5e"
      hideDefaultHandles={true}
    >
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/40 font-bold uppercase tracking-tight">Split Config</span>
          <span className="text-rose-400 font-black">{data.splitPercentage || 50}% A / {100 - (data.splitPercentage || 50)}% B</span>
        </div>

        {isWinnerDeclared && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trophy size={12} className="fill-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">Variant {winnerVariant} Won</span>
          </div>
        )}

        {!isWinnerDeclared && (
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-white/60">Variant A</span>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-white/60">Variant B</span>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-[#6c47ff] border-2 border-[#050510] !z-10"
      />
      
      {/* Variant A Handle */}
      <div className="absolute -bottom-6 left-1/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="A"
          className={cn(
            "w-3 h-3 bg-rose-500 border-2 border-[#050510] !left-0",
            isWinnerDeclared && winnerVariant !== 'A' && "opacity-20"
          )}
        />
        <span className="text-[8px] font-black text-rose-500 mt-1 uppercase tracking-tighter">Path A</span>
      </div>

      {/* Variant B Handle */}
      <div className="absolute -bottom-6 left-3/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="B"
          className={cn(
            "w-3 h-3 bg-blue-500 border-2 border-[#050510] !left-0",
            isWinnerDeclared && winnerVariant !== 'B' && "opacity-20"
          )}
        />
        <span className="text-[8px] font-black text-blue-500 mt-1 uppercase tracking-tighter">Path B</span>
      </div>
    </BaseNode>
  );
});

SplitNode.displayName = 'SplitNode';
