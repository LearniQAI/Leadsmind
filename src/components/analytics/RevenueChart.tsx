'use client';

import { ChartDataPoint } from '@/types/analytics.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-1">Revenue Per Week</h3>
        <p className="text-xs text-white/30">No revenue data for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-white mb-4">Revenue Per Week</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
          />
          <Bar
            dataKey="value"
            fill="var(--chart-2)"
            radius={[6, 6, 0, 0]}
            name="Revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
