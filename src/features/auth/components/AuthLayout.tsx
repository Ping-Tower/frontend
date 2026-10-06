import { GearHero } from './GearHero'
import logo from '/pingtower logo.png'

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

            <div className="flex justify-end border-t border-white/7 pt-5">
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
