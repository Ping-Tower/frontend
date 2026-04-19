import { useAuthStore } from '@/shared/stores/auth.store'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const store = useAuthStore.getState()
  const headers = new Headers({ 'Content-Type': 'application/json', ...init.headers })

  if (store.token) {
    headers.set('Authorization', `Bearer ${store.token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (response.status === 401 && store.refreshToken) {
    const refreshed = await tryRefresh(store.refreshToken)
    if (refreshed) {
      headers.set('Authorization', `Bearer ${useAuthStore.getState().token}`)
      const retry = await fetch(`${BASE_URL}${path}`, { ...init, headers })
      return handleResponse<T>(retry)
    }
    store.clearSession()
    window.location.href = '/login'
    throw new ApiError(401)
  }

  return handleResponse<T>(response)
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body?.message)
  return body?.data as T
}

async function tryRefresh(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false
    const body = await response.json()
    useAuthStore.getState().setSession(body.data)
    return true
  } catch {
    return false
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
