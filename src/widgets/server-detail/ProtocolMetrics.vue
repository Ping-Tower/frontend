<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { ServerMonitoringOverview } from '@/entities'
import { formatLatency, formatBytes, formatPercent, formatDate } from '@/shared/lib/format'
const MetricsChart = defineAsyncComponent(() => import('./MetricsChart.vue'))
const props = defineProps<{ overview: ServerMonitoringOverview }>()
const isHttp = computed(() => ['HTTP', 'HTTPS'].includes(props.overview.target.protocol))
const metrics = computed(() => {
  const s = props.overview.summary,
    p = props.overview.target.protocol
  if (p === 'ICMP')
    return [
      ['Packet loss', formatPercent(s.avgPacketLossPercent)],
      ['Minimum RTT', formatLatency(s.avgRttMinMs)],
      ['Maximum RTT', formatLatency(s.avgRttMaxMs)],
      ['Average TTL', s.avgTtl?.toFixed(0) ?? '—'],
    ]
  if (p === 'TCP')
    return [
      ['Average sent', formatBytes(s.avgSentBytes)],
      ['Average received', formatBytes(s.avgReceivedBytes)],
      ['Total sent', formatBytes(s.totalSentBytes)],
      ['Total received', formatBytes(s.totalReceivedBytes)],
    ]
  return [
    ['DNS lookup', formatLatency(s.avgDnsLookupMs)],
    ['Earliest certificate expiry', formatDate(s.earliestCertExpiresAt)],
    ['Latest certificate expiry', formatDate(s.latestCertExpiresAt)],
    ['TLS versions', s.tlsVersions?.map((v) => v.version).join(', ') || '—'],
  ]
})
</script>
<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="[label, value] in metrics" :key="label" class="card">
        <p class="eyebrow">{{ label }}</p>
        <p class="mt-4 font-display text-3xl break-words">{{ value }}</p>
      </div>
    </div>
    <section class="card">
      <h2 class="section-title">
        {{
          isHttp
            ? 'DNS lookup'
            : overview.target.protocol === 'ICMP'
              ? 'Round-trip time'
              : 'Traffic per check'
        }}
      </h2>
      <MetricsChart
        :chart="overview.chart"
        :metric="isHttp ? 'dns' : overview.target.protocol === 'ICMP' ? 'rtt' : 'traffic'"
      />
    </section>
    <section v-if="overview.target.protocol === 'ICMP'" class="card">
      <h2 class="section-title">Packet loss</h2>
      <MetricsChart :chart="overview.chart" metric="loss" />
    </section>
    <section v-if="isHttp" class="card">
      <h2 class="section-title">Response codes</h2>
      <p v-if="!overview.chart.statusCodes.length" class="py-10 text-muted">
        No response codes in the selected window.
      </p>
      <div
        v-for="item in overview.chart.statusCodes"
        :key="item.code"
        class="mt-4 flex items-center gap-5 font-mono text-sm"
      >
        <span class="w-12">{{ item.code }}</span>
        <div class="h-2 flex-1 bg-surface-panel">
          <div
            class="h-2 bg-stroke"
            :style="{
              width: `${(item.count / Math.max(1, ...overview.chart.statusCodes.map((c) => c.count))) * 100}%`,
            }"
          />
        </div>
        <span>{{ item.count }} responses</span>
      </div>
    </section>
  </div>
</template>
