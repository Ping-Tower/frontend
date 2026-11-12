import { afterEach, expect, it, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/vue'
import NotificationSettingsPage from './NotificationSettingsPage.vue'
import { renderApp } from '@/test/render'
import { ok } from '@/test/fixtures'
afterEach(() => vi.unstubAllGlobals())
it('validates cooldown and saves only explicit changes', async () => {
  let settings = { onDown: true, onUp: true, onLatency: false, cooldownSec: 600 }
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (url, init) => {
    if (String(url).endsWith('/me'))
      return ok({ id: 'u1', userName: 'Alex', email: 'alex@example.com' })
    if (String(url).endsWith('telegram-accounts')) return ok([])
    if (init?.method === 'PATCH') settings = { ...settings, ...JSON.parse(init.body as string) }
    return ok(settings)
  })
  vi.stubGlobal('fetch', fetchMock)
  await renderApp(NotificationSettingsPage)
  const cooldown = await screen.findByLabelText(/Cooldown/)
  expect(screen.getByRole('button', { name: 'Save preferences' })).toBeDisabled()
  await fireEvent.update(cooldown, '1.5')
  expect(screen.getByRole('button', { name: 'Save preferences' })).toBeDisabled()
  await fireEvent.update(cooldown, '0')
  await fireEvent.click(screen.getByRole('button', { name: /Server down/ }))
  await fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Save preferences' })).toBeDisabled(),
  )
  expect(settings).toMatchObject({ onDown: false, onUp: true, onLatency: false, cooldownSec: 0 })
})
it('never shows default rules as loaded data on an API failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })))
  await renderApp(NotificationSettingsPage)
  await screen.findByRole('alert')
  expect(screen.queryByRole('button', { name: 'Save preferences' })).not.toBeInTheDocument()
})
