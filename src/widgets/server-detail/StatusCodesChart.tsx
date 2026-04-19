import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StatusCodeCount } from '@/entities'

interface StatusCodesChartProps {
  data: StatusCodeCount[]
}

const BAR_COLORS = ['#4da8d4', '#5db87a', '#e09a40', '#b87ab0', '#e07060', '#8090a0']

export function StatusCodesChart({ data }: StatusCodesChartProps) {
  const chartData = useMemo(
    () => data.map((item, index) => ({ ...item, fill: BAR_COLORS[index % BAR_COLORS.length] })),
    [data]
  )

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-card border border-line/70 bg-surface-control/70 text-center text-sm text-muted">
        No response codes in the selected window.
      </div>
    )
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="code"
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: 'rgba(18,18,26,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 18px 60px rgba(0,0,0,0.4)',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 13,
              color: '#c8cdd6',
            }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#c8cdd6' }}
            formatter={(value) => [`${value} responses`]}
          />
          <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={42}>
            {chartData.map((entry) => (
              <Cell key={entry.code} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
