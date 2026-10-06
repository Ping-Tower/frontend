import type { Protocol, ServerStatus } from './index'

export type StatusVariant = 'up' | 'down' | 'unknown'

export const PROTOCOLS = ['HTTP', 'HTTPS', 'TCP', 'ICMP'] as const satisfies readonly Protocol[]

export function statusVariant(status: ServerStatus): StatusVariant {
  if (status === 'UP') return 'up'
  if (status === 'DOWN') return 'down'
  return 'unknown'
}

export function isHttpProtocol(protocol: Protocol) {
  return protocol === 'HTTP' || protocol === 'HTTPS'
}

export function formatEndpoint({ protocol, host, port }: { protocol: Protocol; host: string; port: number }) {
  return protocol === 'ICMP' ? host : `${host}:${port}`
}
