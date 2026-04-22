'use client';

import { KpiData } from '@/types/analytics.types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiCardProps {
  title: ReactNode;
  data: KpiData;
  icon: ReactNode;
  format?: 'number' | 'currency' | 'integer';
  iconBg?: string;
}

function formatValue(value: number, format: KpiCardProps['format'] = 'integer'): string {
  if (format === 'currency') {
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  if (format === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toLocaleString();
}

export function KpiCard({ title, data, icon, format = 'integer', iconBg = 'bg-[#6c47ff]/10' }: KpiCardProps) {
  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/5 transition-all">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
          data.isPositive
            ? 'text-emerald-400 bg-emerald-500/10'
            : 'text-red-400 bg-red-500/10'
        }`}>
          {data.isPositive
            ? <ArrowUpRight className="h-3 w-3" />
            : <ArrowDownRight className="h-3 w-3" />
          }
          {data.changePercent}%
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{title}</p>
        <h3 className="text-2xl font-extrabold text-white mt-0.5">
          {formatValue(data.value, format)}
        </h3>
      </div>

      <p className="text-[10px] text-white/20">
        vs {formatValue(data.previousValue, format)} previous period
      </p>
    </div>
  );
}
