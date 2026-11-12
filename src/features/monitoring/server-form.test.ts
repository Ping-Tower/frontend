import { expect, it } from 'vitest'
import { PROTOCOL_DEFAULTS, serverPayload, serverSchema } from './server-form'
it('requires a name, host and valid integer port', () => {
  for (const value of [
    { name: ' ', host: 'api.com', port: 443, protocol: 'HTTPS' },
    { name: 'API', host: '', port: 443, protocol: 'HTTPS' },
    { name: 'API', host: 'api.com', port: 0, protocol: 'HTTPS' },
    { name: 'API', host: 'api.com', port: 65536, protocol: 'HTTPS' },
    { name: 'API', host: 'api.com', port: 1.5, protocol: 'HTTPS' },
  ])
    expect(serverSchema.safeParse(value).success).toBe(false)
})
it('normalizes whitespace and removes ICMP query and port', () => {
  expect(
    serverPayload({
      name: ' Gateway ',
      host: ' 10.0.0.1 ',
      port: 443,
      protocol: 'ICMP',
      query: '/health',
    }),
  ).toEqual({ name: 'Gateway', host: '10.0.0.1', port: 1, protocol: 'ICMP', query: undefined })
  expect(
    serverPayload({
      name: 'API',
      host: 'api.com',
      port: '443',
      protocol: 'HTTPS',
      query: '/health',
    }),
  ).toMatchObject({ port: 443, query: '/health' })
  expect(PROTOCOL_DEFAULTS).toEqual({ HTTP: 80, HTTPS: 443, TCP: 22, ICMP: 1 })
})
