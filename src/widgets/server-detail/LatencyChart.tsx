import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonitoringChart, UptimeStats } from '@/entities'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_TICK,
  LEGEND_PROPS,
  LINE_CURSOR,
  TOOLTIP_PROPS,
} from '@/shared/ui/chart-theme'
import { formatDateTime, formatLatency, formatPercent, formatTime } from '@/shared/lib/format'

interface LatencyChartProps {
  chart?: MonitoringChart
  summary?: UptimeStats
  isLoading?: boolean
  latencyThresholdMs?: number | null
}

const SERIES_LABELS: Record<string, string> = {
  avgLatencyMs: 'Average',
  p50LatencyMs: 'P50',
  p90LatencyMs: 'P90',
  p99LatencyMs: 'P99',
  uptimePct: 'Success rate',
  checks: 'Checks',
}

const PERCENTILE_LINES = [
  { key: 'p50LatencyMs', label: 'P50', color: CHART_COLORS.blue },
  { key: 'p90LatencyMs', label: 'P90', color: CHART_COLORS.green },
  { key: 'p99LatencyMs', label: 'P99', color: CHART_COLORS.red },
] as const

function formatAxisTime(value: number, bucketSizeSec: number, spansMultipleDays: boolean) {
  if (bucketSizeSec < 60) return formatTime(value, true)
  if (spansMultipleDays) return formatDateTime(value)
  return formatTime(value)
}

export function LatencyChart({ chart, summary, isLoading, latencyThresholdMs }: LatencyChartProps) {
  const chartData = useMemo(
    () => chart?.buckets.map((bucket) => ({
      bucketTs: new Date(bucket.bucket).getTime(),
      avgLatencyMs: bucket.avgLatencyMs,
      p50LatencyMs: bucket.p50LatencyMs,
      p90LatencyMs: bucket.p90LatencyMs,
      p99LatencyMs: bucket.p99LatencyMs,
      uptimePct: bucket.totalChecks > 0 ? (bucket.successChecks * 100) / bucket.totalChecks : 0,
      checks: bucket.totalChecks,
    })) ?? [],
    [chart]
  )

  if (isLoading) return <Skeleton className="h-[360px] w-full rounded-card" />

  if (chartData.length === 0 || !chart) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-card border border-line/70 bg-surface-control/70 text-base text-muted">
        No ping data yet for the selected window.
      </div>
    )
  }

  const spansMultipleDays = new Date(chart.from).toDateString() !== new Date(chart.to).toDateString()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span>
          Window:{' '}
          <span className="text-stroke">
            {formatDateTime(chart.from)} to {formatDateTime(chart.to)}
          </span>
        </span>
        <span>
          Bucket size: <span className="text-stroke">{chart.bucketSizeSec}s</span>
        </span>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 12, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="latencyAvgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.slate} stopOpacity={0.24} />
                <stop offset="100%" stopColor={CHART_COLORS.slate} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
            <XAxis
              type="number"
              dataKey="bucketTs"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => formatAxisTime(value, chart.bucketSizeSec, spansMultipleDays)}
              tick={CHART_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tickMargin={10}
            />
            <YAxis
              tick={CHART_TICK}
              tickLine={false}
              axisLine={false}
              unit="ms"
              width={56}
            />
            <Tooltip
              cursor={LINE_CURSOR}
              {...TOOLTIP_PROPS}
              labelFormatter={(value) => formatDateTime(value, chart.bucketSizeSec < 60)}
              formatter={(value, _name, item) => {
                const key = item.dataKey as string
                if (key === 'uptimePct') return [formatPercent(Number(value)), SERIES_LABELS[key]]
                if (key === 'checks') return [`${value}`, SERIES_LABELS[key]]
                return [formatLatency(Number(value)), SERIES_LABELS[key] ?? 'Latency']
              }}
            />
            <Legend {...LEGEND_PROPS} />
            {latencyThresholdMs !== null && latencyThresholdMs !== undefined && (
              <ReferenceLine
                y={latencyThresholdMs}
                stroke={CHART_COLORS.threshold}
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
                label={{ value: 'Threshold', fill: CHART_COLORS.threshold, fontSize: 11, position: 'insideTopRight' }}
              />
            )}
            {PERCENTILE_LINES.map(({ key, label, color }) => {
              const value = summary?.[key] ?? null
              return value === null ? null : (
                <ReferenceLine
                  key={key}
                  y={value}
                  stroke={color}
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                  label={{ value: `${label} ${Math.round(value)}ms`, fill: color, fontSize: 10, position: 'insideTopLeft' }}
                />
              )
            })}
            <Area
              type="monotone"
              dataKey="avgLatencyMs"
              name="Average"
              stroke={CHART_COLORS.slate}
              strokeWidth={2}
              fill="url(#latencyAvgGradient)"
              dot={false}
              connectNulls
            />
            {PERCENTILE_LINES.map(({ key, label, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
