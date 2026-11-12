<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import {
  useOverview,
  useServerSettings,
  useServerState,
  useBaseline,
} from '@/features/monitoring/queries'
import { useMonitoringWindow } from '@/widgets/server-detail/use-monitoring-window'
import { formatEndpoint } from '@/entities/status'
import { formatLatency, formatPercent } from '@/shared/lib/format'
import StatusBadge from '@/shared/ui/StatusBadge.vue'
import Feedback from '@/shared/ui/Feedback.vue'
import MonitoringControls from '@/widgets/server-detail/MonitoringControls.vue'
const MetricsChart = defineAsyncComponent(() => import('@/widgets/server-detail/MetricsChart.vue'))
const CheckRules = defineAsyncComponent(() => import('@/widgets/server-detail/CheckRules.vue'))
const RecentChecks = defineAsyncComponent(() => import('@/widgets/server-detail/RecentChecks.vue'))
const ProtocolMetrics = defineAsyncComponent(
  () => import('@/widgets/server-detail/ProtocolMetrics.vue'),
)
const props = defineProps<{ serverId: string }>()
const settings = useServerSettings(() => props.serverId)
const window = useMonitoringWindow(() => settings.data.value?.intervalSec)
const {
  data: overview,
  isPending,
  isError,
  refetch,
} = useOverview(
  () => props.serverId,
  window.filters,
  () =>
    window.custom.value && Number(window.refresh.value) > 0
      ? Number(window.refresh.value) * 1000
      : false,
)
const state = useServerState(() => props.serverId)
const baseline = useBaseline(
  () => props.serverId,
  () => window.filters.value.to,
)
const tab = ref('overview')
const tabs = [
  ['overview', 'Overview'],
  ['protocol', 'Protocol metrics'],
  ['logs', 'Logs'],
  ['settings', 'Settings'],
]
const stats = computed(() => {
  const s = overview.value?.summary
  return [
    ['Uptime', formatPercent(s?.uptimePct, 2)],
    ['Checks', s?.totalChecks?.toLocaleString() ?? '—'],
    ['Average', formatLatency(s?.avgLatencyMs)],
    ['P90', formatLatency(s?.p90LatencyMs)],
  ]
})
function onTabKey(event: KeyboardEvent, index: number) {
  const next =
    event.key === 'ArrowRight'
      ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft'
        ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : -1
  if (next < 0) return
  event.preventDefault()
  tab.value = tabs[next][0]
  const buttons = (
    event.currentTarget as HTMLElement
  ).parentElement?.querySelectorAll<HTMLButtonElement>('button')
  buttons?.[next]?.focus()
}
</script>
<template>
  <div class="page-content">
    <RouterLink to="/app/servers" class="eyebrow w-fit no-underline">← Monitors</RouterLink>
    <div v-if="isPending" aria-label="Loading monitor" class="space-y-6">
      <div class="skeleton h-16 w-2/3" />
      <div class="skeleton h-40" />
      <div class="skeleton h-80" />
    </div>
    <Feedback
      v-else-if="isError || !overview"
      title="Could not load this monitor."
      @retry="refetch()"
    /><template v-else
      ><header class="flex flex-wrap items-end justify-between gap-6">
        <div class="min-w-0">
          <h1 class="page-title break-words">{{ overview.target.name }}</h1>
          <p class="mt-4 font-mono text-xs text-muted break-all">
            {{ overview.target.protocol }} / {{ formatEndpoint(overview.target)
            }}{{ overview.target.query ?? '' }}
          </p>
        </div>
        <StatusBadge
          :status="state.data.value?.status ?? overview.target.status"
          :paused="!overview.target.isActive"
        />
      </header>
      <div class="kpi-grid">
        <div v-for="[label, value] in stats" :key="label" class="kpi">
          <p class="eyebrow">{{ label }}</p>
          <p class="kpi-value">{{ value }}</p>
        </div>
      </div>
      <div class="segmented" role="tablist" aria-label="Server sections">
        <button
          v-for="([key, label], index) in tabs"
          :id="`tab-${key}`"
          :key="key"
          role="tab"
          :aria-selected="tab === key"
          :aria-controls="`panel-${key}`"
          :tabindex="tab === key ? 0 : -1"
          @click="tab = key"
          @keydown="onTabKey($event, index)"
        >
          {{ label }}
        </button>
      </div>
      <div :id="`panel-${tab}`" role="tabpanel" :aria-labelledby="`tab-${tab}`" tabindex="0">
        <div v-if="tab === 'overview'" class="space-y-6">
          <MonitoringControls :window="window" @refresh="refetch()" />
          <div class="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted">
            <span
              >P50
              <strong class="text-stroke font-normal">{{
                formatLatency(overview.summary.p50LatencyMs)
              }}</strong></span
            >
            <span
              >P99
              <strong class="text-stroke font-normal">{{
                formatLatency(overview.summary.p99LatencyMs)
              }}</strong></span
            >
            <span v-if="baseline.data.value"
              >24h uptime
              <strong class="text-stroke font-normal">{{
                formatPercent(baseline.data.value.uptimePct, 2)
              }}</strong></span
            >
            <span v-if="baseline.data.value"
              >24h P90
              <strong class="text-stroke font-normal">{{
                formatLatency(baseline.data.value.p90LatencyMs)
              }}</strong></span
            >
          </div>
          <section class="card min-w-0">
            <h2 class="section-title">Latency profile</h2>
            <p class="mt-2 mb-6 text-sm text-muted">
              Average response and P50 / P90 / P99. Drag to zoom. Missing checks remain gaps.
            </p>
            <MetricsChart
              :chart="overview.chart"
              :threshold="settings.data.value?.latencyThresholdMs"
            />
          </section>
        </div>
        <ProtocolMetrics v-else-if="tab === 'protocol'" :overview="overview" /><RecentChecks
          v-else-if="tab === 'logs'"
          :server-id="serverId"
          :from="window.filters.value.from!"
          :to="window.filters.value.to!"
        /><CheckRules v-else :server-id="serverId" /></div
    ></template>
  </div>
</template>
