import { useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useSignalRStore } from '@/shared/stores/signalr.store'
import { keys } from './hooks'
import type { Server, ServerMonitoringOverview, ServerState, ServerStatus } from '@/entities'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

interface StatusChangedPayload {
  serverId: string
  status: ServerStatus
}

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const setConnection = useSignalRStore((s) => s.setConnection)
  const setStatus = useSignalRStore((s) => s.setStatus)
  const qc = useQueryClient()

  useEffect(() => {
    if (!token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/monitoring`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('server-status-changed', (payload: StatusChangedPayload) => {
      const { serverId, status } = payload

      // Patch all server list caches, including filtered queries.
      qc.setQueriesData<Server[]>({ queryKey: keys.allServers }, (old) =>
        old?.map((s) => (s.id === serverId ? { ...s, status } : s))
      )
      // Patch detail cache used by the server page.
      qc.setQueryData<Server>(keys.server(serverId), (old) =>
        old ? { ...old, status } : old
      )
      // Patch overview caches so the target header updates immediately.
      qc.setQueriesData<ServerMonitoringOverview>({ queryKey: keys.serverOverviewAll(serverId) }, (old) =>
        old ? { ...old, target: { ...old.target, status } } : old
      )
      // Patch live state immediately and then refetch for canonical state.
      qc.setQueryData<ServerState>(keys.serverState(serverId), { status })
      qc.invalidateQueries({ queryKey: keys.serverState(serverId) })
    })

    setConnection(connection)
    setStatus('connecting')

    connection
      .start()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('error'))

    connection.onreconnecting(() => setStatus('connecting'))
    connection.onreconnected(() => setStatus('connected'))
    connection.onclose(() => setStatus('disconnected'))

    return () => {
      connection.stop()
      setConnection(null)
      setStatus('disconnected')
    }
  }, [token, setConnection, setStatus, qc])

  return <>{children}</>
}
