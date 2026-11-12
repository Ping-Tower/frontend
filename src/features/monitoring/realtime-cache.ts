import type { QueryClient } from '@tanstack/vue-query'
import type { Server, ServerMonitoringOverview, ServerState, ServerStatus } from '@/entities'
import { keys } from './keys'
export interface StatusChangedPayload {
  serverId: string
  status: ServerStatus
}
export function applyStatusChanged(qc: QueryClient, payload: StatusChangedPayload) {
  const { serverId, status } = payload
  qc.setQueriesData<Server[]>({ queryKey: keys.allServers }, (old) =>
    old?.map((s) => (s.id === serverId ? { ...s, status } : s)),
  )
  qc.setQueryData<Server>(keys.server(serverId), (old) => (old ? { ...old, status } : old))
  qc.setQueriesData<ServerMonitoringOverview>(
    { queryKey: keys.serverOverviewAll(serverId) },
    (old) => (old ? { ...old, target: { ...old.target, status } } : old),
  )
  qc.setQueryData<ServerState>(keys.serverState(serverId), { status })
  void qc.invalidateQueries({ queryKey: keys.serverState(serverId) })
}
