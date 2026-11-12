import { ref, watch, onScopeDispose } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '@/shared/stores/auth.store'
import { applyStatusChanged } from './realtime-cache'
import type { StatusChangedPayload } from './realtime-cache'
export const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>(
  'disconnected',
)
export function useRealtime() {
  const auth = useAuthStore(),
    qc = useQueryClient()
  const stop = watch(
    () => auth.token,
    (token, _previous, onCleanup) => {
      if (!token) {
        connectionStatus.value = 'disconnected'
        return
      }
      let disposed = false,
        retry: ReturnType<typeof setTimeout> | undefined
      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL ?? ''}/hubs/monitoring`, {
          accessTokenFactory: () => auth.token ?? '',
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build()
      connection.on('server-status-changed', (payload: StatusChangedPayload) => {
        if (['UP', 'DOWN', 'UNKNOWN'].includes(payload.status)) applyStatusChanged(qc, payload)
      })
      connection.onreconnecting(() => {
        if (!disposed) connectionStatus.value = 'connecting'
      })
      connection.onreconnected(() => {
        if (!disposed) connectionStatus.value = 'connected'
      })
      connection.onclose(() => {
        if (!disposed) connectionStatus.value = 'disconnected'
      })
      async function start() {
        if (disposed) return
        connectionStatus.value = 'connecting'
        try {
          await connection.start()
          if (!disposed) connectionStatus.value = 'connected'
        } catch {
          if (!disposed) {
            connectionStatus.value = 'error'
            retry = setTimeout(start, 10000)
          }
        }
      }
      void start()
      onCleanup(() => {
        disposed = true
        clearTimeout(retry)
        void connection.stop()
        connectionStatus.value = 'disconnected'
      })
    },
    { immediate: true },
  )
  onScopeDispose(stop)
}
