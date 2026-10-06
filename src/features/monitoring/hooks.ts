import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toastError } from '@/shared/lib/toast'
import { serverApi } from './api'
import type {
  MonitoringQueryOptions,
  ServerOverviewFilters,
  ServerPingsFilters,
  ServerUptimeFilters,
} from './types'

export const keys = {
  allServers: ['servers'] as const,
  servers: (search?: string) => ['servers', search ?? ''] as const,
  serverOverviewAll: (id: string) => ['server-overview', id] as const,
  server: (id: string) => ['server', id] as const,
  serverOverview: (id: string, filters?: ServerOverviewFilters) =>
    ['server-overview', id, filters?.from ?? null, filters?.to ?? null, filters?.bucketSec ?? null] as const,
  serverSettings: (id: string) => ['server-settings', id] as const,
  serverState: (id: string) => ['server-state', id] as const,
  serverPings: (id: string, filters?: ServerPingsFilters) =>
    ['server-pings', id, filters?.from ?? null, filters?.to ?? null, filters?.limit ?? null] as const,
  serverUptime: (id: string, filters?: ServerUptimeFilters) =>
    ['server-uptime', id, filters?.from ?? null, filters?.to ?? null] as const,
}

export function useServers(search?: string) {
  return useQuery({
    queryKey: keys.servers(search),
    queryFn: () => serverApi.list(search),
    placeholderData: keepPreviousData,
  })
}

export function useServer(id: string) {
  return useQuery({ queryKey: keys.server(id), queryFn: () => serverApi.get(id), enabled: !!id })
}

export function useServerOverview(
  id: string,
  filters?: ServerOverviewFilters,
  options?: MonitoringQueryOptions
) {
  return useQuery({
    queryKey: keys.serverOverview(id, filters),
    queryFn: () => serverApi.getOverview(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  })
}

export function useServerSettings(id: string) {
  return useQuery({ queryKey: keys.serverSettings(id), queryFn: () => serverApi.getSettings(id), enabled: !!id })
}

export function useServerState(id: string, options?: MonitoringQueryOptions) {
  return useQuery({
    queryKey: keys.serverState(id),
    queryFn: () => serverApi.getState(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval ?? 30_000,
  })
}

export function useServerPings(
  id: string,
  filters?: ServerPingsFilters,
  options?: MonitoringQueryOptions
) {
  return useQuery({
    queryKey: keys.serverPings(id, filters),
    queryFn: () => serverApi.getPings(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  })
}

export function useServerUptime(
  id: string,
  filters?: ServerUptimeFilters,
  options?: MonitoringQueryOptions
) {
  return useQuery({
    queryKey: keys.serverUptime(id, filters),
    queryFn: () => serverApi.getUptimeStats(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  })
}

export function useCreateServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serverApi.create,
    onSuccess: (server) => {
      qc.invalidateQueries({ queryKey: keys.allServers })
      toast.success(`Server "${server.name}" added`)
    },
    onError: toastError,
  })
}

export function useUpdateServer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof serverApi.update>[1]) => serverApi.update(id, body),
    onSuccess: (server) => {
      qc.invalidateQueries({ queryKey: keys.allServers })
      qc.invalidateQueries({ queryKey: keys.server(id) })
      toast.success(`Server "${server.name}" updated`)
    },
    onError: toastError,
  })
}

export function useDeleteServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serverApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.allServers })
      toast.success('Server deleted')
    },
    onError: toastError,
  })
}

export function useUpdateServerSettings(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof serverApi.updateSettings>[1]) => serverApi.updateSettings(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.serverSettings(id) })
      toast.success('Settings saved')
    },
    onError: toastError,
  })
}
