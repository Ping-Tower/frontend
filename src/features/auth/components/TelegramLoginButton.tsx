import { useEffect, useRef } from 'react'
import type { TelegramAuthData } from '../api'

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined

interface TelegramLoginButtonProps {
  onAuth: (data: TelegramAuthData) => void
}

export function TelegramLoginButton({ onAuth }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!BOT_USERNAME || !containerRef.current) return

    // Telegram widget calls a global callback
    const callbackName = '__tgAuthCallback__'
    ;(window as unknown as Record<string, unknown>)[callbackName] = (data: TelegramAuthData) => {
      onAuth(data)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    script.setAttribute('data-request-access', 'write')
    script.async = true

    containerRef.current.appendChild(script)

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName]
      containerRef.current?.querySelector('script')?.remove()
    }
  }, [onAuth])

  if (!BOT_USERNAME) {
    return (
      <p className="text-muted font-alatsi text-sm">
        Set <code className="bg-surface-control px-1 rounded">VITE_TELEGRAM_BOT_USERNAME</code> to enable Telegram login.
      </p>
    )
  }

  return <div ref={containerRef} />
}
