import { effectScope } from 'vue'
import { expect, it, vi, afterEach } from 'vitest'
import { useMonitoringWindow } from './use-monitoring-window'
afterEach(() => vi.useRealTimers())
it('advances rolling windows, honors disabled refresh and disposes its timer', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-12T12:00:00Z'))
  const scope = effectScope()
  const w = scope.run(() => useMonitoringWindow(() => 60))!
  expect(w.filters.value).toEqual({
    from: '2026-11-12T10:00:00.000Z',
    to: '2026-11-12T12:00:00.000Z',
    bucketSec: 60,
  })
  await vi.advanceTimersByTimeAsync(30000)
  expect(w.filters.value.to).toBe('2026-11-12T12:00:30.000Z')
  w.refresh.value = '0'
  await vi.advanceTimersByTimeAsync(60000)
  expect(w.filters.value.to).toBe('2026-11-12T12:00:30.000Z')
  w.select('24h')
  expect(new Date(w.filters.value.to).getTime() - new Date(w.filters.value.from).getTime()).toBe(
    86400000,
  )
  scope.stop()
  expect(vi.getTimerCount()).toBe(0)
})
it('rejects invalid custom ranges and preserves an applied range while time passes', async () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const w = scope.run(() => useMonitoringWindow(() => null))!
  w.fromDraft.value = ''
  w.apply()
  expect(w.custom.value).toBe(false)
  w.fromDraft.value = '2026-11-12T10:00'
  w.toDraft.value = '2026-11-12T11:00'
  w.apply()
  expect(w.custom.value).toBe(true)
  const applied = { ...w.filters.value }
  await vi.advanceTimersByTimeAsync(60000)
  expect(w.filters.value).toEqual(applied)
  w.bucket.value = '120'
  expect(w.filters.value.bucketSec).toBe(120)
  scope.stop()
})
