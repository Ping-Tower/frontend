import type { MonitoringChart, UptimeStats } from '@/entities'

export interface ProtocolMetricsViewProps {
  summary: UptimeStats
  chart: MonitoringChart
}

export function formatExpiryHint(value: string | null | undefined) {
  if (!value) return 'No certificate samples yet'

  const target = new Date(value).getTime()
  const diffMs = target - Date.now()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`
  if (diffDays === 0) return 'today'
  return `in ${diffDays}d`
}
