import { afterEach, expect, it } from 'vitest'
import { authStore } from './auth.store'
import { session } from '@/test/fixtures'
afterEach(() => authStore().clearSession())
it('persists session metadata and removes all credentials on logout', () => {
  authStore().setSession(session)
  expect(authStore().isAuthenticated).toBe(true)
  expect(JSON.parse(localStorage.getItem('pingtower-auth')!).state.token).toBe('access')
  authStore().clearSession()
  expect(authStore().isAuthenticated).toBe(false)
  expect(authStore().refreshToken).toBeUndefined()
  expect(authStore().userName).toBeUndefined()
  expect(localStorage.getItem('pingtower-auth')).toBeNull()
})
