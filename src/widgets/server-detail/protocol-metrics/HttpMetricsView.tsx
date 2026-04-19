import { useMemo } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Protocol } from '@/entities'
import {
  type ProtocolMetricsViewProps,
  CHART_TICK,
  TLS_COLORS,
  TOOLTIP_STYLE,
  formatBucketDateTime,
  formatBucketTime,
  formatBytes,
  formatDate,
  formatExpiryHint,
  formatLatency,
} from './helpers'
import { EmptyChart, MetricTile } from './shared'

interface HttpMetricsViewProps extends ProtocolMetricsViewProps {
  protocol: Protocol
}

export function HttpMetricsView({ summary, chart, protocol }: HttpMetricsViewProps) {
  const dnsData = useMemo(
    () => chart.buckets.map((bucket) => ({
      bucketTs: new Date(bucket.bucket).getTime(),
      avgDnsLookupMs: bucket.avgDnsLookupMs,
      avgLatencyMs: bucket.avgLatencyMs,
    })),
    [chart.buckets]
  )

  const hasDnsData = dnsData.some((b) => b.avgDnsLookupMs !== null || b.avgLatencyMs !== null)
  const isHttps = protocol === 'HTTPS'
  const topTls = summary.tlsVersions[0]

  return (
    <div className="space-y-5">
      {isHttps ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Avg DNS Lookup"
            value={formatLatency(summary.avgDnsLookupMs)}
            accent="text-[#4da8d4]"
            hint="Resolver time across sampled checks"
          />
          <MetricTile
            label="Earliest Cert Expiry"
            value={formatDate(summary.earliestCertExpiresAt)}
            accent="text-[#e07060]"
            hint={formatExpiryHint(summary.earliestCertExpiresAt)}
          />
          <MetricTile
            label="Latest Cert Expiry"
            value={formatDate(summary.latestCertExpiresAt)}
            accent="text-[#5db87a]"
            hint={formatExpiryHint(summary.latestCertExpiresAt)}
          />
          <MetricTile
            label="Dominant TLS"
            value={topTls?.version ?? '—'}
            accent="text-[#b87ab0]"
            hint={topTls ? `${topTls.sharePct.toFixed(1)}% of TLS handshakes` : 'No TLS handshakes yet'}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Avg DNS Lookup"
            value={formatLatency(summary.avgDnsLookupMs)}
            accent="text-[#4da8d4]"
            hint="Resolver time across sampled checks"
          />
          <MetricTile
            label="Avg Sent"
            value={formatBytes(summary.avgSentBytes)}
            accent="text-[#5db87a]"
            hint="Average request size per check"
          />
          <MetricTile
            label="Avg Received"
            value={formatBytes(summary.avgReceivedBytes)}
            accent="text-[#b87ab0]"
            hint="Average response size per check"
          />
          <MetricTile
            label="Total Received"
            value={formatBytes(summary.totalReceivedBytes)}
            accent="text-[#e09a40]"
            hint="Cumulative ingress for the selected window"
          />
        </div>
      )}

      <div className={isHttps ? 'grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]' : undefined}>
        <div className="rounded-[10px] border border-white/7 bg-surface-panel p-4">
          <div className="mb-4">
            <p className="font-alatsi text-sm text-stroke">DNS Resolve Tempo</p>
            <p className="text-sm text-muted">Average DNS lookup time against average latency.</p>
          </div>
          {hasDnsData ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dnsData} margin={{ top: 8, right: 10, bottom: 8, left: -8 }}>
                  <defs>
                    <linearGradient id="httpDnsArea" x1="0" y1="0" x2="0" y2="1">
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
                        avgDnsLookupMs: 'Avg DNS lookup',
                        avgLatencyMs: 'Avg latency',
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
                    name="Avg latency"
                    fill="url(#httpDnsArea)"
                    stroke="#6b7280"
                    strokeWidth={2}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDnsLookupMs"
                    name="Avg DNS lookup"
                    stroke="#4da8d4"
                    strokeWidth={3}
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="DNS telemetry will appear here once checks return metadata." />
          )}
        </div>

        {isHttps && (
          <div className="rounded-[10px] border border-white/7 bg-surface-panel p-4">
            <div className="mb-4">
              <p className="font-alatsi text-sm text-stroke">TLS Version Mix</p>
              <p className="text-sm text-muted">Observed handshakes grouped by protocol version.</p>
            </div>
            {summary.tlsVersions.length > 0 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.tlsVersions} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 12 }}>
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={CHART_TICK} />
                    <YAxis
                      type="category"
                      dataKey="version"
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tick={CHART_TICK}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: '#9ca3af' }}
                      itemStyle={{ color: '#c8cdd6' }}
                      formatter={(value, _name, item) => {
                        const payload = item.payload as { sharePct: number }
                        return [`${value} handshakes`, `${payload.sharePct.toFixed(1)}% share`]
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 12, 12, 0]} maxBarSize={28}>
                      {summary.tlsVersions.map((entry, index) => (
                        <Cell key={entry.version} fill={TLS_COLORS[index % TLS_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="No TLS version samples were captured in the selected window." />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
