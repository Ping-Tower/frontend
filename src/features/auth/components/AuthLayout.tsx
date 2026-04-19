import { Link } from 'react-router'
import { GearHero } from './GearHero'
import logo from '/pingtower logo.png'

const SOCIAL_LINKS = [
  { href: import.meta.env.VITE_SOCIAL_TELEGRAM_URL, label: 'Telegram', icon: TelegramIcon },
  { href: import.meta.env.VITE_SOCIAL_GITHUB_URL, label: 'GitHub', icon: GitHubIcon },
  { href: import.meta.env.VITE_SOCIAL_GITLAB_URL, label: 'GitLab', icon: GitLabIcon },
  { href: import.meta.env.VITE_SOCIAL_LINKEDIN_URL, label: 'LinkedIn', icon: LinkedInIcon },
].filter((item) => typeof item.href === 'string' && item.href.trim().length > 0)

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface-base">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,222,128,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.025) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex min-h-dvh max-w-[1540px] items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="auth-shell grid min-h-[calc(100dvh-2rem)] w-full overflow-hidden rounded-card lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]">
          <div className="flex flex-col justify-between gap-8 px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="PingTower"
                className="h-8 w-auto object-contain"
              />
              <div>
                <p className="font-alatsi text-[0.95rem] font-bold leading-none tracking-[-0.02em] text-stroke">
                  PingTower
                </p>
                <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  monitoring
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6">
              <div className="max-w-[34rem]">
                <div className="auth-form-card mt-2">
                  {children}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/7 pt-5 sm:flex-row sm:items-center sm:justify-between">
              {SOCIAL_LINKS.length > 0 && (
                <div className="flex items-center gap-2">
                  {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-8 items-center justify-center rounded-[4px] border border-white/12 bg-surface-panel text-muted transition-all duration-150 hover:text-stroke hover:bg-surface-elevated"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              )}
              <div className="font-alatsi text-[0.68rem] text-muted">
                by <span className="text-stroke">semao0</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center p-3 lg:flex lg:p-4">
            <GearHero />
          </div>
        </div>
      </div>
    </div>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.845.904a.98.98 0 0 0-.92.618L.05 10.973a1.074 1.074 0 0 0 .379 1.22l11.569 8.434a.034.034 0 0 0 .004.003l.002.001.003.002.003.001.003.002.003.001.003.001.003.001H12.025l.003-.001.003-.001.003-.001.003-.002.003-.001.003-.002.004-.003 11.569-8.434a1.074 1.074 0 0 0 .379-1.22L19.075 1.522a.98.98 0 0 0-.92-.618.98.98 0 0 0-.921.627l-2.859 8.763H9.625L6.766 1.531A.98.98 0 0 0 4.845.904z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export { Link }
