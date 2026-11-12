import { QueryClient } from '@tanstack/vue-query'
import { expect, it } from 'vitest'
import { applyStatusChanged } from './realtime-cache'
import { keys } from './keys'
import { servers } from '@/test/fixtures'
import type { Server, ServerMonitoringOverview } from '@/entities'
it('updates all cached lists, target details, overview ranges and live state', () => {
  const qc = new QueryClient()
  qc.setQueryData(keys.servers(), servers)
  qc.setQueryData(['servers', 'API'], [servers[0]])
  qc.setQueryData(keys.server('s1'), servers[0])
  qc.setQueryData(keys.serverOverview('s1'), { target: servers[0] })
  applyStatusChanged(qc, { serverId: 's1', status: 'DOWN' })
  expect(qc.getQueryData<Server[]>(keys.servers())?.map((s) => s.status)).toEqual([
    'DOWN',
    'DOWN',
    'UNKNOWN',
  ])
  expect(qc.getQueryData<Server[]>(['servers', 'API'])?.[0].status).toBe('DOWN')
  expect(qc.getQueryData<Server>(keys.server('s1'))?.status).toBe('DOWN')
  expect(qc.getQueryData<ServerMonitoringOverview>(keys.serverOverview('s1'))?.target.status).toBe(
    'DOWN',
  )
  expect(qc.getQueryData(keys.serverState('s1'))).toEqual({ status: 'DOWN' })
})
it('does not fabricate a detail or list entry for uncached targets', () => {
  const qc = new QueryClient()
  applyStatusChanged(qc, { serverId: 'missing', status: 'UP' })
  expect(qc.getQueryData(keys.server('missing'))).toBeUndefined()
  expect(qc.getQueryData(keys.servers())).toBeUndefined()
})
