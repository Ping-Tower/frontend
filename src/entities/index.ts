export type Protocol = 'HTTP' | 'HTTPS' | 'TCP' | 'ICMP'
export type ServerStatus = 'UP' | 'DOWN' | 'UNKNOWN'

export interface Server {
  id: string
  name: string
  host: string
  port: number
  protocol: Protocol
  query: string | null
  status: ServerStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServerSettings {
  id?: string
  intervalSec: number | null
  latencyThresholdMs: number | null
  retries: number | null
  failureThreshold: number | null
}

export interface ServerSettingsDto {
  pingSettings: ServerSettings | null
  notificationSettings: NotificationSettings | null
}

export interface ServerState {
  status: ServerStatus
}

export interface PingRecord {
  id: string
  serverId: string
  protocol: Protocol
  timestamp: string
  isSuccess: boolean
  latencyMs: number | null
  errorMessage: string | null
  statusCode: number | null
  certExpiresAt: string | null
  tlsVersion: string | null
  dnsLookupMs: number | null
  sentBytes: number | null
  receivedBytes: number | null
  packetLossPercent: number | null
  rttMinMs: number | null
  rttMaxMs: number | null
  ttl: number | null
}

export interface AuthSession {
  token: string
  refreshToken: string
  expiration: string
  userId: string
  userName: string
}

export interface NotificationSettings {
  id?: string
  onDown?: boolean
  onUp?: boolean
  onLatency?: boolean
  cooldownSec?: number
}

export interface UptimeStats {
  totalChecks: number
  successfulChecks: number
  uptimePct: number
  avgLatencyMs: number | null
  p50LatencyMs: number | null
  p90LatencyMs: number | null
  p99LatencyMs: number | null
  avgDnsLookupMs: number | null
  earliestCertExpiresAt: string | null
  latestCertExpiresAt: string | null
  tlsVersions: TlsVersionStat[]
  avgPacketLossPercent: number | null
  avgRttMinMs: number | null
  avgRttMaxMs: number | null
  avgTtl: number | null
  avgSentBytes: number | null
  avgReceivedBytes: number | null
  totalSentBytes: number | null
  totalReceivedBytes: number | null
}

export interface TlsVersionStat {
  version: string
  count: number
  sharePct: number
}

export interface TargetInfo {
  id: string
  name: string
  host: string
  query: string | null
  port: number
  isActive: boolean
  protocol: Protocol
  status: ServerStatus
  createdAt: string
  updatedAt: string
}

export interface MetricsBucket {
  bucket: string
  totalChecks: number
  successChecks: number
  avgLatencyMs: number | null
  p50LatencyMs: number | null
  p90LatencyMs: number | null
  p99LatencyMs: number | null
  avgDnsLookupMs: number | null
  avgPacketLossPercent: number | null
  avgRttMinMs: number | null
  avgRttMaxMs: number | null
  avgTtl: number | null
  avgSentBytes: number | null
  avgReceivedBytes: number | null
}

export interface StatusCodeCount {
  code: string
  count: number
}

export interface MonitoringChart {
  from: string
  to: string
  bucketSizeSec: number
  buckets: MetricsBucket[]
  statusCodes: StatusCodeCount[]
}

export interface ServerMonitoringOverview {
  target: TargetInfo
  summary: UptimeStats
  chart: MonitoringChart
}

export interface TelegramAccount {
  id: string
  telegramUserId: string
  username: string | null
  createdAt: string
}
