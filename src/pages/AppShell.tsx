import { Outlet, NavLink, useNavigate } from 'react-router'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore } from '@/shared/stores/auth.store'
import logo from '/pingtower logo.png'

const NAV_ITEMS = [
  { to: '/app/servers', label: 'Servers', icon: ServersIcon },
  { to: '/app/settings/notifications', label: 'Notifications', icon: BellIcon },
  { to: '/app/settings/integrations', label: 'Integrations', icon: PuzzleIcon },
]

export function AppShell() {
  const logout = useLogout()
  const userName = useAuthStore((s) => s.userName)
  const navigate = useNavigate()

  return (
    <div className="app-shell min-h-dvh overflow-hidden flex">
      <aside className="surface-card hidden w-56 shrink-0 flex-col p-4 lg:flex h-dvh sticky top-0">
        <div className="flex items-center gap-2.5 border-b border-white/7 pb-4 px-1">
          <img
            src={logo}
            alt="PingTower"
            className="h-7 w-auto cursor-pointer object-contain"
            onClick={() => navigate('/app/servers')}
          />
          <div>
            <div className="font-alatsi text-[0.88rem] font-bold leading-none text-stroke">
              PingTower
            </div>
            <div className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">
              monitoring
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 py-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[0.82rem] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-panel text-stroke outline outline-1 outline-white/12'
                    : 'text-muted hover:bg-surface-elevated hover:text-stroke'
                }`
              }
            >
              <Icon className="size-[15px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 rounded-[6px] border border-white/7 bg-surface-panel px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-muted">Signed in</p>
            <p className="mt-0.5 truncate text-[0.78rem] font-semibold text-stroke">{userName}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex size-7 items-center justify-center rounded-[4px] border border-white/7 bg-surface-elevated text-muted transition-colors hover:text-stroke"
            aria-label="Log out"
          >
            <LogoutIcon className="size-[14px]" />
          </button>
        </div>
      </aside>

      <main className="surface-card min-w-0 flex-1 overflow-hidden border-l border-white/7">
        <div className="h-dvh overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function ServersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="5" rx="1.5" />
      <rect x="2" y="10" width="20" height="5" rx="1.5" />
      <rect x="2" y="17" width="20" height="4" rx="1.5" />
      <circle cx="18" cy="5.5" r="1" fill="currentColor" />
      <circle cx="18" cy="12.5" r="1" fill="currentColor" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
