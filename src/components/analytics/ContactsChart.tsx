'use client';

import { ChartDataPoint } from '@/types/analytics.types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ContactsChartProps {
  data: ChartDataPoint[];
}

export function ContactsChart({ data }: ContactsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-1">New Contacts Over Time</h3>
        <p className="text-xs text-white/30">No contact data for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-white mb-4">New Contacts Over Time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            name="Contacts"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
