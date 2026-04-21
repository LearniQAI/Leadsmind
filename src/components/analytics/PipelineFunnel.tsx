'use client';

import { ChartDataPoint } from '@/types/analytics.types';

interface PipelineFunnelProps {
  data: ChartDataPoint[];
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-1">Pipeline Funnel</h3>
        <p className="text-xs text-white/30">No pipeline data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-white mb-4">Pipeline Funnel</h3>
      <div className="space-y-3">
        {data.map((stage, i) => {
          const pct = Math.max((stage.value / maxVal) * 100, 4);
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 text-right text-[11px] text-white/40 font-medium truncate" title={stage.label}>
                {stage.label}
              </div>
              <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, #6c47ff, #8b5cf6)`,
                    opacity: 1 - i * 0.12,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-white/60 w-8 text-right">{stage.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
