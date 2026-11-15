import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import type { MetricsBucket, MonitoringChart } from '@/entities'
import MetricsChart from './MetricsChart.vue'

vi.mock('vue-echarts', () => ({
  default: { name: 'ChartStub', props: ['option'], render: () => null },
}))

it('shows check counts and preserves zero and missing measurements in the tooltip', () => {
  const bucket: MetricsBucket = {
    bucket: '2026-11-12T10:00:00Z',
    totalChecks: 2,
    successChecks: 1,
    avgLatencyMs: 0,
    p50LatencyMs: 0,
    p90LatencyMs: 0,
    p99LatencyMs: 0,
    avgDnsLookupMs: null,
    avgPacketLossPercent: null,
    avgRttMinMs: null,
    avgRttMaxMs: null,
    avgTtl: null,
    avgSentBytes: null,
    avgReceivedBytes: null,
  }
  const chart: MonitoringChart = {
    from: bucket.bucket,
    to: '2026-11-12T12:00:00Z',
    bucketSizeSec: 300,
    buckets: [bucket],
    statusCodes: [],
  }
  const wrapper = mount(MetricsChart, {
    props: { chart },
  })
  const option = wrapper.findComponent({ name: 'ChartStub' }).props('option')
  const tooltip = option.tooltip.formatter([
    { dataIndex: 0, seriesName: 'Average', value: [bucket.bucket, 0] },
    { dataIndex: 0, seriesName: 'P99', value: [bucket.bucket, null] },
  ])
  expect(tooltip).toContain('Checks: 2 · Successful: 1')
  expect(tooltip).toContain('Average: 0.0 ms')
  expect(tooltip).toContain('P99: No sample')
  expect(option.tooltip.formatter([])).toBe('')
  wrapper.unmount()
})
