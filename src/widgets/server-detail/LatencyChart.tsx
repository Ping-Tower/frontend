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

interface LatencyChartProps {
  chart?: MonitoringChart
  summary?: UptimeStats
  isLoading?: boolean
  latencyThresholdMs?: number | null
}

function formatAxisTime(value: number, bucketSizeSec: number, fromTs: number, toTs: number) {
  const date = new Date(value)
  const spansMultipleDays = new Date(fromTs).toDateString() !== new Date(toTs).toDateString()

  if (bucketSizeSec < 60) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (spansMultipleDays) {
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatLatency(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : `${Math.round(value)} ms`
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

  const fromTs = new Date(chart.from).getTime()
  const toTs = new Date(chart.to).getTime()

  const p50 = summary?.p50LatencyMs ?? null
  const p90 = summary?.p90LatencyMs ?? null
  const p99 = summary?.p99LatencyMs ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span>
          Window:{' '}
          <span className="text-stroke">
            {new Date(chart.from).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {' '}to{' '}
            {new Date(chart.to).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                <stop offset="0%" stopColor="#5a6778" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#5a6778" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              dataKey="bucketTs"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => formatAxisTime(value, chart.bucketSizeSec, fromTs, toTs)}
              tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              unit="ms"
              width={56}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
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
              labelFormatter={(value) =>
                new Date(value).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: chart.bucketSizeSec < 60 ? '2-digit' : undefined,
                })}
              formatter={(value, _name, item) => {
                const labelMap: Record<string, string> = {
                  avgLatencyMs: 'Average',
                  p50LatencyMs: 'P50',
                  p90LatencyMs: 'P90',
                  p99LatencyMs: 'P99',
                  uptimePct: 'Success rate',
                  checks: 'Checks',
                }

                if (item.dataKey === 'uptimePct') return [`${Number(value).toFixed(1)}%`, labelMap[item.dataKey]]
                if (item.dataKey === 'checks') return [`${value}`, labelMap[item.dataKey]]

                return [formatLatency(Number(value)), labelMap[item.dataKey as string] ?? 'Latency']
              }}
            />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="plainline"
              wrapperStyle={{ paddingBottom: '14px', fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#9ca3af' }}
            />
            {latencyThresholdMs !== null && latencyThresholdMs !== undefined && (
              <ReferenceLine
                y={latencyThresholdMs}
                stroke="#b74b4b"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
                label={{ value: 'Threshold', fill: '#b74b4b', fontSize: 11, position: 'insideTopRight' }}
              />
            )}
            {p50 !== null && (
              <ReferenceLine
                y={p50}
                stroke="#4da8d4"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{ value: `P50 ${Math.round(p50)}ms`, fill: '#4da8d4', fontSize: 10, position: 'insideTopLeft' }}
              />
            )}
            {p90 !== null && (
              <ReferenceLine
                y={p90}
                stroke="#5db87a"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{ value: `P90 ${Math.round(p90)}ms`, fill: '#5db87a', fontSize: 10, position: 'insideTopLeft' }}
              />
            )}
            {p99 !== null && (
              <ReferenceLine
                y={p99}
                stroke="#e07060"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{ value: `P99 ${Math.round(p99)}ms`, fill: '#e07060', fontSize: 10, position: 'insideTopLeft' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="avgLatencyMs"
              name="Average"
              stroke="#5a6778"
              strokeWidth={2}
              fill="url(#latencyAvgGradient)"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p50LatencyMs"
              name="P50"
              stroke="#4da8d4"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p90LatencyMs"
              name="P90"
              stroke="#5db87a"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p99LatencyMs"
              name="P99"
              stroke="#e07060"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
