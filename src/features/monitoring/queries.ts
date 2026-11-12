import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import type { Server } from '@/entities'
import { notify } from '@/shared/lib/toast'
import { serverApi } from './api'
import { keys } from './keys'
import type { ServerOverviewFilters, ServerPingsFilters } from './types'
export function useServers() {
  return useQuery({
    queryKey: keys.servers(),
    queryFn: () => serverApi.list(),
    refetchInterval: 60000,
  })
}
export function useServerSettings(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => keys.serverSettings(toValue(id))),
    queryFn: () => serverApi.getSettings(toValue(id)),
  })
}
export function useOverview(
  id: MaybeRefOrGetter<string>,
  filters: MaybeRefOrGetter<ServerOverviewFilters>,
  refreshInterval: MaybeRefOrGetter<number | false> = false,
) {
  return useQuery({
    queryKey: computed(() => keys.serverOverview(toValue(id), toValue(filters))),
    queryFn: () => serverApi.getOverview(toValue(id), toValue(filters)),
    refetchInterval: computed(() => toValue(refreshInterval)),
    placeholderData: keepPreviousData,
  })
}
export function useServerState(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => keys.serverState(toValue(id))),
    queryFn: () => serverApi.getState(toValue(id)),
    refetchInterval: 30000,
  })
}
export function usePings(
  id: MaybeRefOrGetter<string>,
  filters: MaybeRefOrGetter<ServerPingsFilters>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => keys.serverPings(toValue(id), toValue(filters))),
    queryFn: () => serverApi.getPings(toValue(id), toValue(filters)),
    enabled: computed(() => toValue(enabled)),
    placeholderData: keepPreviousData,
  })
}
export function useServerMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Parameters<typeof serverApi.create>[0] }) =>
      id ? serverApi.update(id, body) : serverApi.create(body),
    onSuccess: (server: Server) => {
      void qc.invalidateQueries({ queryKey: keys.allServers })
      void qc.invalidateQueries({ queryKey: keys.server(server.id) })
      void qc.invalidateQueries({ queryKey: keys.serverOverviewAll(server.id) })
      notify('Monitor saved.')
    },
  })
}
export function useDeleteServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serverApi.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.allServers })
      notify('Monitor deleted.')
    },
  })
}
export function useUpdateSettings(id: MaybeRefOrGetter<string>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof serverApi.updateSettings>[1]) =>
      serverApi.updateSettings(toValue(id), body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.serverSettings(toValue(id)) })
      notify('Check rules saved.')
    },
  })
}

export function useBaseline(
  id: MaybeRefOrGetter<string>,
  to: MaybeRefOrGetter<string | undefined>,
) {
  const filters = computed(() => {
    const end = toValue(to)
    return end
      ? { to: end, from: new Date(new Date(end).getTime() - 86400000).toISOString() }
      : undefined
  })
  return useQuery({
    queryKey: computed(() => keys.serverUptime(toValue(id), filters.value)),
    queryFn: () => serverApi.getUptimeStats(toValue(id), filters.value),
  })
}
