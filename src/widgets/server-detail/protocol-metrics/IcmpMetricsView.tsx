import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_TICK,
  LEGEND_PROPS,
  LINE_CURSOR,
  TOOLTIP_PROPS,
} from '@/shared/ui/chart-theme'
import { formatDateTime, formatLatency, formatPercent, formatTime } from '@/shared/lib/format'
import { type ProtocolMetricsViewProps } from './helpers'
import { EmptyChart, MetricTile } from './shared'

export function IcmpMetricsView({ summary, chart }: ProtocolMetricsViewProps) {
  const icmpData = useMemo(
    () => chart.buckets.map((bucket) => ({
      bucketTs: new Date(bucket.bucket).getTime(),
      avgPacketLossPercent: bucket.avgPacketLossPercent,
      avgRttMinMs: bucket.avgRttMinMs,
      avgRttMaxMs: bucket.avgRttMaxMs,
    })),
    [chart.buckets]
  )

  const hasIcmpData = icmpData.some((bucket) =>
    bucket.avgPacketLossPercent !== null || bucket.avgRttMinMs !== null || bucket.avgRttMaxMs !== null
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Avg Packet Loss"
          value={formatPercent(summary.avgPacketLossPercent)}
          accent="text-[#e07060]"
          hint="Failure pressure across all ICMP probes"
        />
        <MetricTile
          label="Avg RTT Floor"
          value={formatLatency(summary.avgRttMinMs)}
          accent="text-[#4da8d4]"
          hint="Fastest response segment seen"
        />
        <MetricTile
          label="Avg RTT Ceiling"
          value={formatLatency(summary.avgRttMaxMs)}
          accent="text-[#5db87a]"
          hint="Upper edge of observed round-trip time"
        />
        <MetricTile
          label="Avg TTL"
          value={summary.avgTtl === null || summary.avgTtl === undefined ? '—' : `${summary.avgTtl.toFixed(1)}`}
          accent="text-[#b87ab0]"
          hint="Hop distance fingerprint from replies"
        />
      </div>

      <div className="rounded-[10px] border border-white/7 bg-surface-panel p-4">
        <div className="mb-4">
          <p className="font-alatsi text-sm text-stroke">Signal Quality</p>
          <p className="text-sm text-muted">Packet loss against the lower and upper RTT envelope for each bucket.</p>
        </div>
        {hasIcmpData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={icmpData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="icmpLossArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis
                  type="number"
                  dataKey="bucketTs"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => formatTime(value)}
                  tickLine={false}
                  axisLine={false}
                  tick={CHART_TICK}
                />
                <YAxis
                  yAxisId="rtt"
                  tickLine={false}
                  axisLine={false}
                  tick={CHART_TICK}
                  unit="ms"
                  width={56}
                />
                <YAxis
                  yAxisId="loss"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={CHART_TICK}
                  unit="%"
                  width={52}
                />
                <Tooltip
                  cursor={LINE_CURSOR}
                  {...TOOLTIP_PROPS}
                  labelFormatter={(value) => formatDateTime(Number(value))}
                  formatter={(value, _name, item) => {
                    const labelMap: Record<string, string> = {
                      avgPacketLossPercent: 'Avg packet loss',
                      avgRttMinMs: 'Avg RTT min',
                      avgRttMaxMs: 'Avg RTT max',
                    }

                    if (item.dataKey === 'avgPacketLossPercent') {
                      return [formatPercent(Number(value)), labelMap[item.dataKey]]
                    }

                    return [formatLatency(Number(value)), labelMap[item.dataKey as string] ?? 'Metric']
                  }}
                />
                <Legend {...LEGEND_PROPS} />
                <Area
                  yAxisId="loss"
                  type="monotone"
                  dataKey="avgPacketLossPercent"
                  name="Avg packet loss"
                  fill="url(#icmpLossArea)"
                  stroke={CHART_COLORS.red}
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  yAxisId="rtt"
                  type="monotone"
                  dataKey="avgRttMinMs"
                  name="Avg RTT min"
                  stroke={CHART_COLORS.blue}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="rtt"
                  type="monotone"
                  dataKey="avgRttMaxMs"
                  name="Avg RTT max"
                  stroke={CHART_COLORS.green}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Packet loss and RTT telemetry will appear here once ICMP probes start recording extended metrics." />
        )}
      </div>
    </div>
  )
}
