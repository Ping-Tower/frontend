import { defineStore, createPinia } from 'pinia'
import type { AuthSession } from '@/entities'
export const pinia = createPinia()
export const AUTH_STORAGE_KEY = 'pingtower-auth'
function readSession(): Partial<AuthSession> {
  try {
    const value = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? 'null')
    // Read existing React sessions too, so migration does not sign users out.
    const data = value?.state ?? value
    return typeof data?.token === 'string' && typeof data?.refreshToken === 'string' ? data : {}
  } catch {
    return {}
  }
}
export const useAuthStore = defineStore('auth', {
  state: (): Partial<AuthSession> => ({
    token: undefined,
    refreshToken: undefined,
    expiration: undefined,
    userId: undefined,
    userName: undefined,
    ...readSession(),
  }),
  getters: { isAuthenticated: (state) => !!state.token },
  actions: {
    setSession(session: AuthSession) {
      this.$patch(session)
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ state: session, version: 0 }))
      } catch {
        /* Session remains available in memory. */
      }
    },
    clearSession() {
      this.$patch({
        token: undefined,
        refreshToken: undefined,
        expiration: undefined,
        userId: undefined,
        userName: undefined,
      })
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        /* Storage can be disabled by the browser. */
      }
    },
  },
})
export const authStore = () => useAuthStore(pinia)
