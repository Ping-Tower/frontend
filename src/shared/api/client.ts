import { authStore } from '@/shared/stores/auth.store'
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
export class ApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}
let refreshPromise: Promise<boolean> | null = null

async function refreshSession(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false
    const body = await response.json()
    // A response arriving after logout must never restore the old session.
    if (authStore().refreshToken !== refreshToken) return false
    if (!body?.data?.token || !body?.data?.refreshToken) return false
    authStore().setSession(body.data)
    return true
  } catch {
    return false
  }
}
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body?.message)
  return body?.data as T
}
function sessionSnapshot() {
  const { token, refreshToken } = authStore()
  return { token, refreshToken }
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = sessionSnapshot()
  const headers = new Headers(init.headers)
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`)
  let response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  // Auth failures (e.g. a bad password) must not trigger a token refresh.
  if (response.status === 401 && session.token && !path.startsWith('/api/auth/')) {
    let current = sessionSnapshot()
    if (current.token === session.token && current.refreshToken) {
      refreshPromise ??= refreshSession(current.refreshToken).finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      current = sessionSnapshot()
    }
    if (current.token && current.token !== session.token) {
      headers.set('Authorization', `Bearer ${current.token}`)
      response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
    }
    if (response.status === 401) {
      // The root session watcher redirects and clears private caches.
      if (authStore().token === current.token) authStore().clearSession()
    }
  }
  return handleResponse<T>(response)
}
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
