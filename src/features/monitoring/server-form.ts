import { z } from 'zod'
import { PROTOCOLS } from '@/entities/status'
import type { Protocol } from '@/entities'
export const PROTOCOL_DEFAULTS: Record<Protocol, number> = {
  HTTP: 80,
  HTTPS: 443,
  TCP: 22,
  ICMP: 1,
}
export const serverSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  host: z.string().trim().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535),
  protocol: z.enum(PROTOCOLS),
  query: z.string().optional(),
})
export function serverPayload(input: unknown) {
  const result = serverSchema.parse(input)
  return result.protocol === 'ICMP' ? { ...result, port: 1, query: undefined } : result
}
