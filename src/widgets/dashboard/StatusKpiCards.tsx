import { useServers } from '@/features/monitoring/hooks'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Protocol, ServerStatus } from '@/entities'

const PROTOCOLS: Protocol[] = ['HTTP', 'HTTPS', 'TCP', 'ICMP']

export function StatusKpiCards() {
  const { data: servers, isLoading } = useServers()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      </div>
    )
  }

  const total = servers?.length ?? 0
  const statusCounts: Record<ServerStatus, number> = { UP: 0, DOWN: 0, UNKNOWN: 0 }
  const protocolCounts: Record<Protocol, number> = { HTTP: 0, HTTPS: 0, TCP: 0, ICMP: 0 }
  servers?.forEach((s) => {
    statusCounts[s.status]++
    protocolCounts[s.protocol]++
  })

  const statusCards = [
    { label: 'Total',   value: total,               border: 'border-white/7',                    bg: 'bg-surface-panel',            text: 'text-stroke' },
    { label: 'Up',      value: statusCounts.UP,      border: 'border-[rgba(74,222,128,0.25)]',    bg: 'bg-[rgba(74,222,128,0.08)]',  text: 'text-status-up' },
    { label: 'Down',    value: statusCounts.DOWN,    border: 'border-[rgba(248,113,113,0.25)]',   bg: 'bg-[rgba(248,113,113,0.08)]', text: 'text-status-down' },
    { label: 'Unknown', value: statusCounts.UNKNOWN, border: 'border-[rgba(107,114,128,0.20)]',   bg: 'bg-[rgba(107,114,128,0.08)]', text: 'text-status-unknown' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statusCards.map(({ label, value, border, bg, text }) => (
          <div key={label} className={`rounded-[8px] border ${border} ${bg} p-4`}>
            <p className={`font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.08em] opacity-60 ${text}`}>
              {label}
            </p>
            <p className={`mt-2 font-alatsi text-[1.8rem] font-bold tracking-[-0.03em] leading-none ${text}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {PROTOCOLS.map((proto) => (
          <div key={proto} className="rounded-[8px] border border-white/7 bg-surface-panel px-4 py-3 flex items-center justify-between">
            <p className="font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
              {proto}
            </p>
            <p className="font-alatsi text-[1.1rem] font-bold text-stroke leading-none">
              {protocolCounts[proto]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
