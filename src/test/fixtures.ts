import type { AuthSession, Server } from '@/entities'
export const session: AuthSession = {
  token: 'access',
  refreshToken: 'refresh',
  expiration: '2030-01-01',
  userId: 'u1',
  userName: 'Alex',
}
export const servers: Server[] = [
  {
    id: 's1',
    name: 'Production API',
    host: 'api.example.com',
    port: 443,
    protocol: 'HTTPS',
    status: 'UP',
    isActive: true,
    query: '/health',
    createdAt: '2026-11-01',
    updatedAt: '2026-11-12',
  },
  {
    id: 's2',
    name: 'Mail',
    host: 'mail.example.com',
    port: 25,
    protocol: 'TCP',
    status: 'DOWN',
    isActive: true,
    query: null,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-12',
  },
  {
    id: 's3',
    name: 'Router',
    host: '10.0.0.1',
    port: 1,
    protocol: 'ICMP',
    status: 'UNKNOWN',
    isActive: false,
    query: null,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-12',
  },
]
export const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ code: status, message: 'OK', data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
