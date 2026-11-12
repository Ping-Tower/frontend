import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './client'
import { authStore } from '@/shared/stores/auth.store'
import { session, ok } from '@/test/fixtures'
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  authStore().clearSession()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())
describe('API transport and session recovery', () => {
  it('unwraps data and attaches bearer authorization', async () => {
    authStore().setSession(session)
    fetchMock.mockResolvedValue(ok({ id: 's1' }))
    await expect(api.get('/api/servers')).resolves.toEqual({ id: 's1' })
    const init = fetchMock.mock.calls[0][1]!
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer access')
  })
  it('serializes mutation bodies and accepts an empty delete response', async () => {
    fetchMock
      .mockResolvedValueOnce(ok({ name: 'API' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    await api.post('/api/servers', { name: 'API' })
    expect(fetchMock.mock.calls[0][1]?.body).toBe('{"name":"API"}')
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Content-Type')).toBe(
      'application/json',
    )
    await expect(api.delete('/api/servers/s1')).resolves.toBeUndefined()
  })
  it('preserves API errors and handles non-JSON errors', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{"message":"Not yours"}', { status: 403 }))
      .mockResolvedValueOnce(new Response('Gateway error', { status: 502 }))
    await expect(api.get('/api/servers')).rejects.toMatchObject({
      status: 403,
      message: 'Not yours',
    })
    await expect(api.get('/api/servers')).rejects.toBeInstanceOf(ApiError)
  })
  it('shares one refresh across concurrent unauthorized requests', async () => {
    authStore().setSession(session)
    fetchMock.mockImplementation(async (url, init) => {
      if (String(url).endsWith('/refresh'))
        return ok({ ...session, token: 'new-access', refreshToken: 'rotated' })
      if (new Headers(init?.headers).get('Authorization') === 'Bearer new-access')
        return ok(['server'])
      return new Response(null, { status: 401 })
    })
    await expect(Promise.all([api.get('/api/servers'), api.get('/api/users/me')])).resolves.toEqual(
      [['server'], ['server']],
    )
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/refresh'))).toHaveLength(1)
    expect(authStore().token).toBe('new-access')
  })
  it('clears the session when refresh fails', async () => {
    authStore().setSession(session)
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    await expect(api.get('/api/servers')).rejects.toMatchObject({ status: 401 })
    expect(authStore().token).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
  it('does not refresh a rejected login', async () => {
    authStore().setSession(session)
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    await expect(api.post('/api/auth/login', {})).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(authStore().token).toBe('access')
  })
  it('retries only once, then clears a still-rejected session', async () => {
    authStore().setSession(session)
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(ok({ ...session, token: 'new' }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
    await expect(api.get('/api/servers')).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(authStore().token).toBeUndefined()
  })
  it('cannot restore a session after logout while refresh is pending', async () => {
    authStore().setSession(session)
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockImplementationOnce(async () => {
        authStore().clearSession()
        return ok({ ...session, token: 'late' })
      })
    await expect(api.get('/api/servers')).rejects.toMatchObject({ status: 401 })
    expect(authStore().token).toBeUndefined()
  })
  it('clears a session when the refresh request has a network failure', async () => {
    authStore().setSession(session)
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockRejectedValueOnce(new TypeError('Offline'))
    await expect(api.get('/api/servers')).rejects.toMatchObject({ status: 401 })
    expect(authStore().token).toBeUndefined()
  })
  it('supports PUT and PATCH requests', async () => {
    fetchMock.mockResolvedValue(ok({}))
    await api.put('/api/servers/s1', { name: 'New' })
    await api.patch('/api/servers/s1/settings', { retries: 0 })
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(['PUT', 'PATCH'])
  })
})

it('does not clear a newer login when an older retried request returns 401', async () => {
  authStore().setSession(session)
  fetchMock
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(ok({ ...session, token: 'refreshed' }))
    .mockImplementationOnce(async () => {
      authStore().setSession({ ...session, token: 'new-login', userId: 'u2' })
      return new Response(null, { status: 401 })
    })
  await expect(api.get('/api/servers')).rejects.toMatchObject({ status: 401 })
  expect(authStore().token).toBe('new-login')
})
