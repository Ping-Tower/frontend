import { useState } from 'react'
import { StatusKpiCards } from '@/widgets/dashboard/StatusKpiCards'
import { ServerTable } from '@/widgets/server-table/ServerTable'
import { ServerDialog } from '@/widgets/server-table/ServerDialog'
import type { Server } from '@/entities'
import { PageHeader } from '@/shared/ui/page-header'

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
      <PageHeader
        title="Servers"
        description="Monitor uptime, latency, and status transitions from a calmer control surface."
      />

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
