import type { TelegramAuthData } from './api'
export interface TelegramLoginSdk {
  auth: (
    options: { bot_id: number; request_access: 'write' },
    callback: (data: TelegramAuthData | false) => void,
  ) => void
}
export function currentTelegramLogin() {
  return (window as unknown as { Telegram?: { Login?: TelegramLoginSdk } }).Telegram?.Login
}
let loading: Promise<TelegramLoginSdk> | undefined
export function loadTelegramLogin(): Promise<TelegramLoginSdk> {
  const existing = currentTelegramLogin()
  if (existing) return Promise.resolve(existing)
  if (loading) return loading
  loading = new Promise<TelegramLoginSdk>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    const timer = window.setTimeout(() => fail(), 15000)
    function fail() {
      window.clearTimeout(timer)
      script.remove()
      reject(new Error('Could not load Telegram. Check your connection and try again.'))
    }
    script.onerror = fail
    script.onload = () => {
      window.clearTimeout(timer)
      const sdk = currentTelegramLogin()
      if (sdk) resolve(sdk)
      else fail()
    }
    document.head.appendChild(script)
  }).catch((error) => {
    loading = undefined
    throw error
  })
  return loading
}
