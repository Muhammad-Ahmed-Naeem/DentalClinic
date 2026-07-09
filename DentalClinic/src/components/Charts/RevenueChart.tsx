import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './RevenueChart.module.css';

interface DataPoint {
  name: string;
  revenue: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 300 }) => {
  return (
    <div className={styles.chartWrapper} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.35} />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148, 163, 184, 0.2)"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter' }}
            tickFormatter={(value) => `$${value / 1000}k`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              boxShadow: '0 10px 25px -5px rgba(11, 15, 25, 0.1)',
              fontFamily: 'Inter',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="url(#strokeRevenue)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{
              r: 6,
              fill: '#0EA5E9',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
