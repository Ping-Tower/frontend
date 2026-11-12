<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  AriaComponent,
  MarkLineComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { MonitoringChart } from '@/entities'
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  AriaComponent,
  MarkLineComponent,
])
const props = defineProps<{
  chart: MonitoringChart
  metric?: 'latency' | 'dns' | 'loss' | 'rtt' | 'traffic'
  threshold?: number | null
}>()
const series = computed(() =>
  props.metric === 'dns'
    ? [['avgDnsLookupMs', 'DNS', '#0a0a0a', 'solid']]
    : props.metric === 'loss'
      ? [['avgPacketLossPercent', 'Packet loss', '#0a0a0a', 'solid']]
      : props.metric === 'rtt'
        ? [
            ['avgRttMinMs', 'Minimum RTT', '#0a0a0a', 'solid'],
            ['avgRttMaxMs', 'Maximum RTT', '#777', 'dashed'],
          ]
        : props.metric === 'traffic'
          ? [
              ['avgSentBytes', 'Sent', '#0a0a0a', 'solid'],
              ['avgReceivedBytes', 'Received', '#777', 'dashed'],
            ]
          : [
              ['avgLatencyMs', 'Average', '#0a0a0a', 'solid'],
              ['p50LatencyMs', 'P50', '#555', 'dotted'],
              ['p90LatencyMs', 'P90', '#888', 'dashed'],
              ['p99LatencyMs', 'P99', '#aaa', 'dotted'],
            ],
)
const unit = computed(() =>
  props.metric === 'loss' ? '%' : props.metric === 'traffic' ? ' B' : ' ms',
)
const option = computed(() => ({
  animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  aria: {
    enabled: true,
    description: `${props.metric ?? 'latency'} measurements over the selected time range. Missing samples are gaps.`,
  },
  textStyle: { fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#6b6b6b' },
  grid: { left: 56, right: 24, top: 50, bottom: 80 },
  legend: { top: 0, left: 0, icon: 'line', textStyle: { fontSize: 11, color: '#6b6b6b' } },
  tooltip: {
    trigger: 'axis',
    confine: true,
    renderMode: 'richText',
    backgroundColor: '#fff',
    borderColor: '#0a0a0a',
    textStyle: { color: '#0a0a0a', fontSize: 12 },
    valueFormatter: (value: unknown) =>
      value == null ? 'No sample' : `${Number(value).toFixed(1)}${unit.value}`,
  },
  xAxis: {
    type: 'time',
    axisLine: { lineStyle: { color: '#d9d9d9' } },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: `{value}${unit.value}` },
    splitLine: { lineStyle: { color: '#eaeae6' } },
  },
  dataZoom: [
    { type: 'inside', filterMode: 'none' },
    {
      type: 'slider',
      height: 22,
      bottom: 10,
      borderColor: '#d9d9d9',
      fillerColor: '#0a0a0a10',
      handleStyle: { color: '#0a0a0a' },
      dataBackground: { lineStyle: { color: '#aaa' }, areaStyle: { color: '#f4f4f2' } },
    },
  ],
  series: series.value.map(([key, name, color, type], index) => ({
    type: 'line',
    name,
    showSymbol: false,
    connectNulls: false,
    lineStyle: { width: index ? 1.5 : 2, color, type },
    itemStyle: { color },
    data: props.chart.buckets.map((b) => [b.bucket, b[key as keyof typeof b]]),
    ...(index === 0 && props.threshold != null
      ? {
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#0a0a0a', type: 'dashed' },
            data: [{ yAxis: props.threshold, name: 'Threshold' }],
            label: { formatter: 'Threshold' },
          },
        }
      : {}),
  })),
}))
</script>
<template>
  <div
    v-if="!chart.buckets.length"
    class="flex h-72 items-center justify-center text-center text-sm text-muted"
  >
    No ping data yet for the selected window.
  </div>
  <VChart v-else class="metric-chart" :option="option" autoresize />
</template>
<style scoped>
.metric-chart {
  height: 360px;
  width: 100%;
  min-width: 0;
}
</style>
