import { afterEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import TelegramLogin from './TelegramLogin.vue'
import { loadTelegramLogin } from './telegram-login'
vi.mock('./telegram-login', () => ({ loadTelegramLogin: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(loadTelegramLogin).mockReset()
})
it('uses the styled button and forwards every signed field unchanged', async () => {
  vi.stubEnv('VITE_TELEGRAM_BOT_USERNAME', 'ping_tower_bot')
  vi.stubEnv('VITE_TELEGRAM_BOT_ID', '123')
  const data = {
    id: 5,
    first_name: 'Ivan',
    last_name: 'Иванов',
    username: 'ivan',
    auth_date: 123,
    hash: 'signature',
  }
  const auth = vi.fn((_options, callback) => callback(data))
  vi.mocked(loadTelegramLogin).mockResolvedValue({ auth })
  const onAuth = vi.fn()
  render(TelegramLogin, { props: { onAuth } })
  const button = await screen.findByRole('button', { name: /Connect Telegram/ })
  await waitFor(() => expect(button).toBeEnabled())
  await fireEvent.click(button)
  expect(auth).toHaveBeenCalledWith({ bot_id: 123, request_access: 'write' }, expect.any(Function))
  expect(onAuth).toHaveBeenCalledWith(data)
  expect(document.querySelector('iframe')).toBeNull()
})
it('can retry loading the Telegram script after a network failure', async () => {
  vi.stubEnv('VITE_TELEGRAM_BOT_USERNAME', 'ping_tower_bot')
  vi.stubEnv('VITE_TELEGRAM_BOT_ID', '123')
  vi.mocked(loadTelegramLogin)
    .mockRejectedValueOnce(new Error('Could not load Telegram.'))
    .mockResolvedValueOnce({ auth: vi.fn() })
  render(TelegramLogin)
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load Telegram')
  await fireEvent.click(screen.getByRole('button', { name: /Try Telegram again/ }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Connect Telegram/ })).toBeEnabled(),
  )
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
