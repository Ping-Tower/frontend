import type { ServerOverviewFilters, ServerPingsFilters, ServerUptimeFilters } from './types'
export const keys = {
  allServers: ['servers'] as const,
  servers: () => ['servers'] as const,
  server: (id: string) => ['server', id] as const,
  serverOverviewAll: (id: string) => ['server-overview', id] as const,
  serverOverview: (id: string, filters?: ServerOverviewFilters) =>
    ['server-overview', id, filters?.from, filters?.to, filters?.bucketSec] as const,
  serverSettings: (id: string) => ['server-settings', id] as const,
  serverState: (id: string) => ['server-state', id] as const,
  serverPings: (id: string, filters?: ServerPingsFilters) =>
    ['server-pings', id, filters?.from, filters?.to, filters?.limit] as const,
  serverUptime: (id: string, filters?: ServerUptimeFilters) =>
    ['server-uptime', id, filters?.from, filters?.to] as const,
}
