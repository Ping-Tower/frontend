import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useServers, useDeleteServer } from '@/features/monitoring/hooks'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { cn } from '@/shared/lib/cn'
import { formatEndpoint, statusVariant } from '@/entities/status'
import type { Server } from '@/entities'

const COLUMNS = ['Name', 'Host', 'Protocol', 'Status', 'Actions'] as const

interface ServerTableProps {
  onEdit: (server: Server) => void
  onAdd: () => void
}

export function ServerTable({ onEdit, onAdd }: ServerTableProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: servers, isLoading } = useServers(debouncedSearch || undefined)
  const deleteServer = useDeleteServer()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deletingServer = servers?.find((s) => s.id === deletingId)

  function confirmDelete() {
    if (!deletingId) return
    deleteServer.mutate(deletingId, { onSettled: () => setDeletingId(null) })
  }

  // The global empty state only makes sense without an active search; otherwise
  // the search box would disappear together with the results.
  if (!isLoading && servers?.length === 0 && !search && !debouncedSearch) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-white/12 rounded-[8px]">
        <div className="text-center">
          <p className="font-alatsi text-base font-semibold text-stroke">No servers yet</p>
          <p className="font-sans text-sm text-muted mt-1">Add your first server to start monitoring.</p>
        </div>
        <Button size="xs" onClick={onAdd}>+ Add server</Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1"
            placeholder="Search servers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button size="xs" onClick={onAdd}>
            + Add server
          </Button>
        </div>

        <div className="border border-white/7 rounded-[8px] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-panel border-b border-white/12">
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className={cn(
                      'px-4 py-2.5 font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted',
                      col === 'Actions' ? 'text-right' : 'text-left'
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/7">
                    <td className="px-4 py-3" colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && servers?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-sans text-sm text-muted">
                    No servers match your search.
                  </td>
                </tr>
              )}

              {servers?.map((server) => (
                <tr
                  key={server.id}
                  className="border-t border-white/7 hover:bg-surface-elevated transition-colors cursor-pointer"
                  onClick={() => navigate(`/app/servers/${server.id}`)}
                >
                  <td className="px-4 py-3 font-alatsi text-sm font-semibold text-stroke">{server.name}</td>
                  <td className="px-4 py-3 font-alatsi text-[0.78rem] text-muted">
                    {formatEndpoint(server)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{server.protocol}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(server.status)}>{server.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="xs" variant="outline" onClick={() => onEdit(server)}>
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={deleteServer.isPending && deletingId === server.id}
                        onClick={() => setDeletingId(server.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete server"
        description={`Delete "${deletingServer?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isPending={deleteServer.isPending}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  )
}
