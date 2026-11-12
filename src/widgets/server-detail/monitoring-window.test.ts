import { expect, it } from 'vitest'
import { isValidRange, parseDateTimeLocalValue, toDateTimeLocalValue } from './monitoring-window'
it('rejects missing, reversed, equal and invalid ranges', () => {
  const start = new Date('2026-11-12T10:00:00Z')
  const end = new Date('2026-11-12T11:00:00Z')
  expect(isValidRange(start, end)).toBe(true)
  expect(isValidRange(end, start)).toBe(false)
  expect(isValidRange(start, start)).toBe(false)
  expect(isValidRange(null, end)).toBe(false)
  expect(isValidRange(start, null)).toBe(false)
  expect(parseDateTimeLocalValue('invalid')).toBeNull()
  expect(parseDateTimeLocalValue('')).toBeNull()
})
it('round trips datetime-local values without a timezone shift', () => {
  const value = '2026-11-12T14:35'
  expect(toDateTimeLocalValue(parseDateTimeLocalValue(value)!)).toBe(value)
})
