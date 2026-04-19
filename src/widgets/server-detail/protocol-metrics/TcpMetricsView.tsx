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
  type ProtocolMetricsViewProps,
  CHART_TICK,
  TOOLTIP_STYLE,
  formatBucketDateTime,
  formatBucketTime,
  formatLatency,
} from './helpers'
import { EmptyChart, MetricTile } from './shared'

export function TcpMetricsView({ summary, chart }: ProtocolMetricsViewProps) {
  const tcpData = useMemo(
    () => chart.buckets.map((bucket) => ({
      bucketTs: new Date(bucket.bucket).getTime(),
      avgLatencyMs: bucket.avgLatencyMs,
      avgDnsLookupMs: bucket.avgDnsLookupMs,
    })),
    [chart.buckets]
  )

  const hasData = tcpData.some((b) => b.avgLatencyMs !== null || b.avgDnsLookupMs !== null)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Avg Connect Latency"
          value={formatLatency(summary.avgLatencyMs)}
          accent="text-[#4da8d4]"
          hint="Average TCP handshake completion time"
        />
        <MetricTile
          label="Avg DNS Lookup"
          value={formatLatency(summary.avgDnsLookupMs)}
          accent="text-[#5db87a]"
          hint="Resolver time before connect"
        />
      </div>

      <div className="rounded-[10px] border border-white/7 bg-surface-panel p-4">
        <div className="mb-4">
          <p className="font-alatsi text-sm text-stroke">Connect Latency</p>
          <p className="text-sm text-muted">TCP handshake time against DNS resolution overhead per bucket.</p>
        </div>
        {hasData ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tcpData} margin={{ top: 8, right: 10, bottom: 8, left: -8 }}>
                <defs>
                  <linearGradient id="tcpLatencyArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4da8d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4da8d4" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="bucketTs"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={formatBucketTime}
                  tickLine={false}
                  axisLine={false}
                  tick={CHART_TICK}
                />
                <YAxis tickLine={false} axisLine={false} tick={CHART_TICK} unit="ms" width={56} />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#c8cdd6' }}
                  labelFormatter={(value) => formatBucketDateTime(Number(value))}
                  formatter={(value, _name, item) => {
                    const labels: Record<string, string> = {
                      avgLatencyMs: 'Avg connect',
                      avgDnsLookupMs: 'Avg DNS lookup',
                    }
                    return [formatLatency(Number(value)), labels[item.dataKey as string] ?? 'Metric']
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="left"
                  iconType="plainline"
                  wrapperStyle={{ paddingBottom: '14px', fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#9ca3af' }}
                />
                <Area
                  type="monotone"
                  dataKey="avgLatencyMs"
                  name="Avg connect"
                  fill="url(#tcpLatencyArea)"
                  stroke="#4da8d4"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="avgDnsLookupMs"
                  name="Avg DNS lookup"
                  stroke="#5db87a"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Connect latency telemetry will appear here once TCP probes start recording." />
        )}
      </div>
    </div>
  )
}