import { expect, it } from 'vitest'
import { formatEndpoint, isHttpProtocol, statusVariant } from './status'
it('maps each known status without interpreting unknown as a failure', () => {
  expect(
    ['UP', 'DOWN', 'UNKNOWN'].map((s) => statusVariant(s as 'UP' | 'DOWN' | 'UNKNOWN')),
  ).toEqual(['up', 'down', 'unknown'])
})
it('uses endpoint ports only for protocols that have ports', () => {
  expect(formatEndpoint({ protocol: 'ICMP', host: '10.0.0.1', port: 1 })).toBe('10.0.0.1')
  expect(formatEndpoint({ protocol: 'HTTPS', host: 'api.example.com', port: 443 })).toBe(
    'api.example.com:443',
  )
  expect(
    ['HTTP', 'HTTPS', 'TCP', 'ICMP'].map((p) =>
      isHttpProtocol(p as 'HTTP' | 'HTTPS' | 'TCP' | 'ICMP'),
    ),
  ).toEqual([true, true, false, false])
})
