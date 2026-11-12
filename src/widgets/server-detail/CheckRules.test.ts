import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/vue'
import CheckRules from './CheckRules.vue'
import { renderApp } from '@/test/render'
import { ok } from '@/test/fixtures'
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(
    ok({
      pingSettings: { intervalSec: 60, latencyThresholdMs: 500, retries: 2, failureThreshold: 3 },
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())
it('loads rules, rejects invalid numbers, and accepts zero retries', async () => {
  await renderApp(CheckRules, { serverId: 's1' })
  const interval = await screen.findByLabelText('Interval (sec)')
  expect(interval).toHaveValue(60)
  await fireEvent.update(interval, '0')
  expect(screen.getByRole('button', { name: 'Save settings' })).toBeDisabled()
  await fireEvent.update(interval, '30')
  await fireEvent.update(screen.getByLabelText('Retries'), '0')
  await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))
  await waitFor(() =>
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true),
  )
  const body = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')?.[1]?.body
  expect(JSON.parse(body as string)).toMatchObject({ intervalSec: 30, retries: 0 })
})
it('supports resetting a field to its default and cancelling edits', async () => {
  await renderApp(CheckRules, { serverId: 's1' })
  await screen.findByLabelText('Interval (sec)')
  await fireEvent.update(screen.getByLabelText('Retries'), '5')
  await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.getByLabelText('Retries')).toHaveValue(2)
  await fireEvent.update(screen.getByLabelText('Latency threshold (ms)'), '')
  await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))
  await waitFor(() =>
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true),
  )
  expect(
    JSON.parse(
      fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')![1]!.body as string,
    ).latencyThresholdMs,
  ).toBeNull()
})
