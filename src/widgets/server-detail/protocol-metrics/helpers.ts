import type { CSSProperties } from 'react'
import type { MonitoringChart, UptimeStats } from '@/entities'

export interface ProtocolMetricsViewProps {
  summary: UptimeStats
  chart: MonitoringChart
}

export const TLS_COLORS = ['#4da8d4', '#5db87a', '#e09a40', '#b87ab0', '#8090a0', '#b0bec9']

export const TOOLTIP_STYLE: CSSProperties = {
  background: 'rgba(18,18,26,0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  boxShadow: '0 18px 60px rgba(0,0,0,0.4)',
  fontFamily: 'Manrope, sans-serif',
  fontSize: 13,
  color: '#c8cdd6',
}

export const CHART_TICK = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: 12,
  fill: '#6b7280',
}

export function formatLatency(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : `${Math.round(value)} ms`
}

export function formatPercent(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined ? '—' : `${value.toFixed(digits)}%`
}

export function formatBytes(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'

  const units = ['B', 'KB', 'MB', 'GB']
  let current = value
  let unitIndex = 0

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024
    unitIndex++
  }

  const digits = current >= 100 || unitIndex === 0 ? 0 : 1
  return `${current.toFixed(digits)} ${units[unitIndex]}`
}

export function formatBucketTime(value: number) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBucketDateTime(value: number) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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
