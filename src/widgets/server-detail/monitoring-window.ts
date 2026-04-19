export type WindowKey = '30m' | '2h' | '12h' | '24h'
export type BucketOption = 'auto' | '5' | '10' | '30' | '60' | '120'
export type RefreshOption = '0' | '5' | '10' | '30' | '60' | '120'
export type RangeMode = 'preset' | 'custom'

export const WINDOW_OPTIONS = [
  { key: '30m', label: '30m', ms: 30 * 60 * 1000 },
  { key: '2h', label: '2h', ms: 2 * 60 * 60 * 1000 },
  { key: '12h', label: '12h', ms: 12 * 60 * 60 * 1000 },
  { key: '24h', label: '24h', ms: 24 * 60 * 60 * 1000 },
] as const

export function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function parseDateTimeLocalValue(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateRange(from: string, to: string) {
  return `${new Date(from).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} – ${new Date(to).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
}
