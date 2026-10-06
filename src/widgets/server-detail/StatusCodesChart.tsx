import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StatusCodeCount } from '@/entities'
import {
  BAR_CURSOR,
  CHART_GRID_STROKE,
  CHART_PALETTE,
  CHART_TICK,
  TOOLTIP_PROPS,
} from '@/shared/ui/chart-theme'

interface StatusCodesChartProps {
  data: StatusCodeCount[]
}

export function StatusCodesChart({ data }: StatusCodesChartProps) {
  const chartData = useMemo(
    () => data.map((item, index) => ({ ...item, fill: CHART_PALETTE[index % CHART_PALETTE.length] })),
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
          <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
          <XAxis
            dataKey="code"
            tickLine={false}
            axisLine={false}
            tick={CHART_TICK}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={CHART_TICK}
          />
          <Tooltip
            cursor={BAR_CURSOR}
            {...TOOLTIP_PROPS}
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
