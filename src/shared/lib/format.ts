type Nullable<T> = T | null | undefined

export const EMPTY = '—'

const SHORT_DATE_TIME: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }

export function formatLatency(value: Nullable<number>) {
  return value === null || value === undefined ? EMPTY : `${Math.round(value)} ms`
}

export function formatPercent(value: Nullable<number>, digits = 1) {
  return value === null || value === undefined ? EMPTY : `${value.toFixed(digits)}%`
}

export function formatBytes(value: Nullable<number>) {
  if (value === null || value === undefined) return EMPTY

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

export function formatDate(value: Nullable<string>) {
  if (!value) return EMPTY
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value: string | number | Date, withSeconds = false) {
  return new Date(value).toLocaleString([], {
    ...SHORT_DATE_TIME,
    second: withSeconds ? '2-digit' : undefined,
  })
}

export function formatTime(value: string | number | Date, withSeconds = false) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
  })
}

export function formatDateRange(from: string, to: string) {
  return `${formatDateTime(from)} – ${formatDateTime(to)}`
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
