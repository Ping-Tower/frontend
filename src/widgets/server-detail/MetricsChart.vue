<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/shared/lib/theme'
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
import type { TooltipComponentFormatterCallbackParams } from 'echarts'
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
const theme = useTheme()
const palette = computed(() =>
  theme.value === 'dark'
    ? {
        line: '#e6e8e5',
        muted: '#a6adb3',
        second: '#c2c9ce',
        third: '#9ba5ae',
        fourth: '#808c96',
        border: '#3d444b',
        grid: '#30363b',
        background: '#1b1e21',
        fill: '#e6e8e51a',
        panel: '#24282c',
      }
    : {
        line: '#0a0a0a',
        muted: '#6b6b6b',
        second: '#555',
        third: '#888',
        fourth: '#aaa',
        border: '#d9d9d9',
        grid: '#eaeae6',
        background: '#fff',
        fill: '#0a0a0a10',
        panel: '#f4f4f2',
      },
)
const series = computed(() =>
  props.metric === 'dns'
    ? [['avgDnsLookupMs', 'DNS', palette.value.line, 'solid']]
    : props.metric === 'loss'
      ? [['avgPacketLossPercent', 'Packet loss', palette.value.line, 'solid']]
      : props.metric === 'rtt'
        ? [
            ['avgRttMinMs', 'Minimum RTT', palette.value.line, 'solid'],
            ['avgRttMaxMs', 'Maximum RTT', palette.value.second, 'dashed'],
          ]
        : props.metric === 'traffic'
          ? [
              ['avgSentBytes', 'Sent', palette.value.line, 'solid'],
              ['avgReceivedBytes', 'Received', palette.value.second, 'dashed'],
            ]
          : [
              ['avgLatencyMs', 'Average', palette.value.line, 'solid'],
              ['p50LatencyMs', 'P50', palette.value.second, 'dotted'],
              ['p90LatencyMs', 'P90', palette.value.third, 'dashed'],
              ['p99LatencyMs', 'P99', palette.value.fourth, 'dotted'],
            ],
)
const unit = computed(() =>
  props.metric === 'loss' ? '%' : props.metric === 'traffic' ? ' B' : ' ms',
)
function formatTooltip(params: TooltipComponentFormatterCallbackParams) {
  const points = Array.isArray(params) ? params : [params]
  const first = points[0]
  const bucket = first && props.chart.buckets[first.dataIndex]
  if (!bucket) return ''
  const lines = [
    new Date(bucket.bucket).toLocaleString(),
    `Checks: ${bucket.totalChecks} · Successful: ${bucket.successChecks}`,
    ...points.map((point) => {
      const value = Array.isArray(point.value) ? point.value[1] : null
      return `${point.seriesName}: ${value == null ? 'No sample' : `${Number(value).toFixed(1)}${unit.value}`}`
    }),
  ]
  return lines.join('\n')
}
const option = computed(() => ({
  animation: false,
  aria: {
    enabled: true,
    description: `${props.metric ?? 'latency'} measurements over the selected time range. Missing samples are gaps.`,
  },
  textStyle: { fontFamily: 'DM Mono, monospace', fontSize: 11, color: palette.value.muted },
  grid: { left: 56, right: 24, top: 50, bottom: 80 },
  legend: {
    top: 0,
    left: 0,
    icon: 'line',
    textStyle: { fontSize: 11, color: palette.value.muted },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
    renderMode: 'richText',
    backgroundColor: palette.value.background,
    borderColor: palette.value.line,
    textStyle: { color: palette.value.line, fontSize: 12 },
    formatter: formatTooltip,
  },
  xAxis: {
    type: 'time',
    axisLine: { lineStyle: { color: palette.value.border } },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: `{value}${unit.value}` },
    splitLine: { lineStyle: { color: palette.value.grid } },
  },
  dataZoom: [
    { type: 'inside', filterMode: 'none' },
    {
      type: 'slider',
      height: 22,
      bottom: 10,
      borderColor: palette.value.border,
      fillerColor: palette.value.fill,
      handleStyle: { color: palette.value.line },
      textStyle: { color: palette.value.muted },
      dataBackground: {
        lineStyle: { color: palette.value.fourth },
        areaStyle: { color: palette.value.panel },
      },
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
            lineStyle: { color: palette.value.line, type: 'dashed' },
            data: [{ yAxis: props.threshold, name: 'Threshold' }],
            label: { formatter: 'Threshold', color: palette.value.muted },
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
