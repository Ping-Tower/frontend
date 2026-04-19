import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession } from '@/entities'

interface AuthStore extends Partial<AuthSession> {
  setSession: (session: AuthSession) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: undefined,
      refreshToken: undefined,
      expiration: undefined,
      userId: undefined,
      userName: undefined,

      setSession: (session) => set(session),
      clearSession: () =>
        set({ token: undefined, refreshToken: undefined, expiration: undefined, userId: undefined, userName: undefined }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'pingtower-auth' }
  )
)
