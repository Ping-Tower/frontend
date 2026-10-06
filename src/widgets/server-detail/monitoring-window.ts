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

export const BUCKET_OPTIONS: { value: BucketOption; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '5', label: '5 sec' },
  { value: '10', label: '10 sec' },
  { value: '30', label: '30 sec' },
  { value: '60', label: '1 min' },
  { value: '120', label: '2 min' },
]

export const REFRESH_OPTIONS: { value: RefreshOption; label: string }[] = [
  { value: '0', label: 'Off' },
  ...BUCKET_OPTIONS.flatMap(({ value, label }) => (value === 'auto' ? [] : [{ value, label }])),
]

export function isValidRange(from: Date | null, to: Date | null): boolean {
  return from !== null && to !== null && from.getTime() < to.getTime()
}

export function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function parseDateTimeLocalValue(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
