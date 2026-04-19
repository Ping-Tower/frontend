import { useState } from 'react'
import { StatusKpiCards } from '@/widgets/dashboard/StatusKpiCards'
import { ServerTable } from '@/widgets/server-table/ServerTable'
import { ServerDialog } from '@/widgets/server-table/ServerDialog'
import type { Server } from '@/entities'

export function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Server | null>(null)

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(server: Server) {
    setEditing(server)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-7">
      <div>
        <p className="font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">
          Operations overview
        </p>
        <h1 className="mt-1.5 font-alatsi text-[1.8rem] font-bold tracking-[-0.03em] text-stroke leading-none">
          Servers
        </h1>
        <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-muted">
          Monitor uptime, latency, and status transitions from a calmer control surface.
        </p>
      </div>

      <StatusKpiCards />

      <ServerTable onEdit={openEdit} onAdd={openAdd} />

      <ServerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </div>
  )
}
