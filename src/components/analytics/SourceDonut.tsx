'use client';

import { ChartDataPoint } from '@/types/analytics.types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

interface SourceDonutProps {
  data: ChartDataPoint[];
}

export function SourceDonut({ data }: SourceDonutProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-1">Contacts by Source</h3>
        <p className="text-xs text-white/30">No source data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-white mb-4">Contacts by Source</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="label"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
