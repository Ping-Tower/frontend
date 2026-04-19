import { api } from '@/shared/api/client'
import type {
  PingRecord,
  Server,
  ServerMonitoringOverview,
  ServerSettings,
  ServerSettingsDto,
  ServerState,
  UptimeStats,
} from '@/entities'
import type { ServerOverviewFilters, ServerPingsFilters, ServerUptimeFilters } from './types'

type QueryValue = string | number | null | undefined

function buildQuery<T extends object>(params?: T) {
  if (!params) return ''

  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params as Record<string, QueryValue>)) {
    if (value === undefined || value === null || value === '') continue
    query.set(key, String(value))
  }

  const search = query.toString()
  return search ? `?${search}` : ''
}

export const serverApi = {
  list: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    return api.get<Server[]>(`/api/servers${q}`)
  },
  get: (id: string) => api.get<Server>(`/api/servers/${id}`),
  create: (body: { name: string; host: string; port: number; protocol: string; query?: string }) =>
    api.post<Server>('/api/servers', body),
  update: (id: string, body: { name: string; host: string; port: number; protocol: string; query?: string }) =>
    api.put<Server>(`/api/servers/${id}`, body),
  delete: (id: string) => api.delete<void>(`/api/servers/${id}`),

  getSettings: (id: string) =>
    api.get<ServerSettingsDto>(`/api/servers/${id}/settings`).then((dto) => dto.pingSettings),
  updateSettings: (id: string, body: Partial<ServerSettings>) =>
    api.patch<ServerSettings>(`/api/servers/${id}/settings`, body),

  getState: (id: string) => api.get<ServerState>(`/api/servers/${id}/state`),

  getOverview: (id: string, params?: ServerOverviewFilters) =>
    api.get<ServerMonitoringOverview>(`/api/servers/${id}/overview${buildQuery(params)}`),

  getUptimeStats: (id: string, params?: ServerUptimeFilters) =>
    api.get<UptimeStats>(`/api/servers/${id}/uptime${buildQuery(params)}`),

  getPings: (id: string, params?: ServerPingsFilters) =>
    api.get<PingRecord[]>(`/api/servers/${id}/pings${buildQuery(params)}`),
}
