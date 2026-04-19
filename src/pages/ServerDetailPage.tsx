import { Suspense, lazy, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  useServerOverview,
  useServerSettings,
  useServerState,
  useServerUptime,
} from '@/features/monitoring/hooks'
import type { ServerStatus } from '@/entities'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { TabPanel, Tabs } from '@/shared/ui/tabs'
import { LatencyChart } from '@/widgets/server-detail/LatencyChart'
import { MonitoringWindowCard } from '@/widgets/server-detail/MonitoringWindowCard'
import { StatusCodesChart } from '@/widgets/server-detail/StatusCodesChart'
import { SummaryCards } from '@/widgets/server-detail/SummaryCards'
import { useMonitoringWindow } from '@/widgets/server-detail/useMonitoringWindow'

type TabKey = 'overview' | 'protocol' | 'logs' | 'settings'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'protocol', label: 'Protocol' },
  { key: 'logs', label: 'Logs' },
  { key: 'settings', label: 'Settings' },
]

const ProtocolMetricsPanel = lazy(() =>
  import('@/widgets/server-detail/ProtocolMetricsPanel').then((module) => ({ default: module.ProtocolMetricsPanel }))
)
const LogsTab = lazy(() =>
  import('@/widgets/server-detail/LogsTab').then((module) => ({ default: module.LogsTab }))
)
const SettingsTab = lazy(() =>
  import('@/widgets/server-detail/SettingsTab').then((module) => ({ default: module.SettingsTab }))
)

function statusVariant(s: ServerStatus): 'up' | 'down' | 'unknown' {
  if (s === 'UP') return 'up'
  if (s === 'DOWN') return 'down'
  return 'unknown'
}

function formatLatency(ms: number | null | undefined) {
  return ms === null || ms === undefined ? '—' : `${Math.round(ms)} ms`
}

function TabShellFallback({ title, description, tall = false }: { title: string; description: string; tall?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-3 ${tall ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          <Skeleton className="h-24 rounded-[18px]" />
          <Skeleton className="h-24 rounded-[18px]" />
          <Skeleton className={tall ? 'hidden md:block h-24 rounded-[18px]' : 'h-24 rounded-[18px]'} />
        </div>
        <Skeleton className={tall ? 'mt-4 h-[360px] rounded-[20px]' : 'mt-4 h-[220px] rounded-[20px]'} />
      </CardContent>
    </Card>
  )
}

export function ServerDetailPage() {
  const { serverId } = useParams<{ serverId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const { data: settings } = useServerSettings(serverId!)
  const monitoringWindow = useMonitoringWindow(settings?.intervalSec)

  const { data: overview, isLoading } = useServerOverview(serverId!, monitoringWindow.overviewFilters, {
    refetchInterval: monitoringWindow.metricsRefetchInterval,
  })
  const { data: baselineStats } = useServerUptime(serverId!, monitoringWindow.baselineFilters, {
    refetchInterval: monitoringWindow.metricsRefetchInterval,
  })
  const { data: state } = useServerState(serverId!, {
    refetchInterval: monitoringWindow.refreshOption === '0' ? 30_000 : Number(monitoringWindow.refreshOption) * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="p-8 text-center text-lg text-muted">
        Server not found.{' '}
        <button onClick={() => navigate('/app/servers')} className="text-stroke underline">
          Back to servers
        </button>
      </div>
    )
  }

  const server = overview.target
  const summary = overview.summary
  const liveStatus = state?.status ?? server.status
  const supportsResponseCodes = server.protocol === 'HTTP' || server.protocol === 'HTTPS'

  const statCards = [
    {
      label: 'Uptime',
      value: `${summary.uptimePct.toFixed(2)}%`,
      tone:
        summary.uptimePct >= 99 ? 'text-status-up'
        : summary.uptimePct >= 95 ? 'text-status-unknown'
        : 'text-status-down',
    },
    { label: 'Checks', value: summary.totalChecks.toLocaleString(), tone: 'text-stroke' },
    { label: 'Average', value: formatLatency(summary.avgLatencyMs), tone: 'text-stroke' },
    { label: 'P50', value: formatLatency(summary.p50LatencyMs), tone: 'text-stroke' },
    { label: 'P90', value: formatLatency(summary.p90LatencyMs), tone: 'text-stroke' },
    { label: 'P99', value: formatLatency(summary.p99LatencyMs), tone: 'text-stroke' },
  ]

  const monitoringWindowProps = {
    windowKey: monitoringWindow.windowKey,
    rangeMode: monitoringWindow.rangeMode,
    bucketOption: monitoringWindow.bucketOption,
    refreshOption: monitoringWindow.refreshOption,
    customRangeDraft: monitoringWindow.customRangeDraft,
    activeBucketSec: overview.chart.bucketSizeSec,
    displayRange: monitoringWindow.displayRange,
    isCustomRangeValid: monitoringWindow.isCustomRangeValid,
    onPreset: monitoringWindow.resetToPreset,
    onRefreshNow: monitoringWindow.refreshNow,
    onDraftChange: monitoringWindow.setCustomRangeDraft,
    onApplyRange: monitoringWindow.applyCustomRange,
    onResetToPreset: () => monitoringWindow.resetToPreset(),
    onBucketChange: monitoringWindow.setBucketOption,
    onRefreshChange: monitoringWindow.setRefreshOption,
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/7 px-5 pb-5 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
        <button
          onClick={() => navigate('/app/servers')}
          className="inline-flex items-center gap-1 font-alatsi text-[0.78rem] text-muted transition-colors hover:text-stroke"
        >
          ← Servers
        </button>

        <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="font-alatsi text-[1.9rem] font-bold leading-none tracking-[-0.04em] text-stroke sm:text-[2.2rem]">
              {server.name}
            </h1>
            <p className="mt-2 max-w-3xl font-alatsi text-[0.82rem] text-muted">
              {server.protocol}
              {server.protocol === 'ICMP' ? ` · ${server.host}` : ` · ${server.host}:${server.port}`}
              {server.query ? ` · ${server.query}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(liveStatus)}>{liveStatus}</Badge>
            <div className="rounded-[4px] border border-white/7 px-3 py-1.5 font-alatsi text-[0.72rem] text-muted">
              {new Date(server.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <Tabs tabs={TABS} active={activeTab} onChange={(k) => setActiveTab(k as TabKey)} className="mt-5 border-b-0" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        <TabPanel value="overview" active={activeTab}>
          <div className="flex flex-col gap-5">
            <MonitoringWindowCard {...monitoringWindowProps}>
              <CardContent>
                <SummaryCards items={statCards} />
              </CardContent>

              {baselineStats && (
                <CardContent className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-[6px] border border-white/7 bg-surface-control p-3">
                    <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">24h Baseline Uptime</p>
                    <p className="mt-1.5 font-alatsi text-[1.2rem] font-bold tracking-[-0.02em] text-stroke">
                      {baselineStats.uptimePct.toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-[6px] border border-white/7 bg-surface-control p-3">
                    <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">24h Baseline P90</p>
                    <p className="mt-1.5 font-alatsi text-[1.2rem] font-bold tracking-[-0.02em] text-stroke">
                      {formatLatency(baselineStats.p90LatencyMs)}
                    </p>
                  </div>
                </CardContent>
              )}
            </MonitoringWindowCard>

            <div className={supportsResponseCodes ? 'grid gap-6 2xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]' : 'grid gap-6'}>
              <Card>
                <CardHeader>
                  <CardTitle>Latency Profile</CardTitle>
                  <CardDescription>Average latency with P50/P90/P99 percentile reference lines.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LatencyChart
                    chart={overview.chart}
                    summary={summary}
                    latencyThresholdMs={settings?.latencyThresholdMs ?? null}
                  />
                </CardContent>
              </Card>

              {supportsResponseCodes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Response Codes</CardTitle>
                    <CardDescription>Most frequent status codes in the current window.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StatusCodesChart data={overview.chart.statusCodes} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabPanel>

        <TabPanel value="protocol" active={activeTab}>
          <Suspense fallback={<TabShellFallback title="Protocol Metrics" description="Loading protocol-specific metrics and charts." tall />}>
            <ProtocolMetricsPanel
              protocol={server.protocol}
              summary={summary}
              chart={overview.chart}
            />
          </Suspense>
        </TabPanel>

        <TabPanel value="logs" active={activeTab}>
          <Suspense fallback={<TabShellFallback title="Recent Checks" description="Loading raw probe results for the selected range." tall />}>
            <LogsTab
              key={`${monitoringWindow.overviewFilters.from}-${monitoringWindow.overviewFilters.to}`}
              serverId={serverId!}
              from={monitoringWindow.overviewFilters.from}
              to={monitoringWindow.overviewFilters.to}
              refetchInterval={monitoringWindow.metricsRefetchInterval}
            />
          </Suspense>
        </TabPanel>

        <TabPanel value="settings" active={activeTab}>
          <Suspense fallback={<TabShellFallback title="Ping Settings" description="Loading target interval and retry controls." />}>
            <SettingsTab serverId={serverId!} />
          </Suspense>
        </TabPanel>
      </div>
    </div>
  )
}
