import { afterEach, expect, it, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/vue'
import AuthPage from './AuthPage.vue'
import { renderApp } from '@/test/render'
import { authStore } from '@/shared/stores/auth.store'
import { ok, session } from '@/test/fixtures'
afterEach(() => {
  vi.unstubAllGlobals()
  authStore().clearSession()
})
it('validates an empty password before submitting', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  await renderApp(AuthPage, { mode: 'login' }, '/login')
  await fireEvent.update(screen.getByLabelText('Email'), 'alex@example.com')
  await fireEvent.click(screen.getByRole('button', { name: 'Login' }))
  expect(await screen.findByText('Password is required')).toBeVisible()
  expect(fetchMock).not.toHaveBeenCalled()
})
it('submits login credentials and persists the session', async () => {
  const fetchMock = vi.fn().mockResolvedValue(ok(session))
  vi.stubGlobal('fetch', fetchMock)
  await renderApp(AuthPage, { mode: 'login' }, '/login')
  await fireEvent.update(screen.getByLabelText('Email'), 'alex@example.com')
  await fireEvent.update(screen.getByLabelText('Password'), 'secret123')
  await fireEvent.click(screen.getByRole('button', { name: 'Login' }))
  await waitFor(() => expect(authStore().token).toBe('access'))
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
    email: 'alex@example.com',
    password: 'secret123',
  })
})
it('displays authentication failures without losing form input', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('{"message":"Invalid credentials"}', { status: 401 })),
  )
  await renderApp(AuthPage, { mode: 'login' }, '/login')
  await fireEvent.update(screen.getByLabelText('Email'), 'alex@example.com')
  await fireEvent.update(screen.getByLabelText('Password'), 'incorrect')
  await fireEvent.click(screen.getByRole('button', { name: 'Login' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  expect(authStore().token).toBeUndefined()
})

it('registers and keeps the email for the verification screen', async () => {
  const fetchMock = vi.fn().mockResolvedValue(ok({ userId: 'u1', userName: 'Alex' }))
  vi.stubGlobal('fetch', fetchMock)
  const { router } = await renderApp(AuthPage, { mode: 'register' }, '/register')
  await fireEvent.update(screen.getByLabelText('Email'), 'alex@example.com')
  await fireEvent.update(screen.getByLabelText('Username'), 'Alex')
  await fireEvent.update(screen.getByLabelText(/Password/), 'secret123')
  await fireEvent.click(screen.getByRole('button', { name: 'Register' }))
  await waitFor(() => expect(router.currentRoute.value.path).toBe('/verify-email'))
  expect(sessionStorage.getItem('pendingVerifyEmail')).toBe('alex@example.com')
  expect(authStore().token).toBeUndefined()
})

it('verifies a link and restores the authenticated session', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(session)))
  const { router } = await renderApp(
    AuthPage,
    { mode: 'verify-email' },
    '/verify-email?email=alex%40example.com&code=abc',
  )
  await waitFor(() => expect(router.currentRoute.value.path).toBe('/app/servers'))
  expect(authStore().token).toBe('access')
  expect(sessionStorage.getItem('pendingVerifyEmail')).toBeNull()
})

it('gives a recovery action for an incomplete password-reset link', async () => {
  await renderApp(AuthPage, { mode: 'reset-password' }, '/reset-password')
  expect(screen.getByRole('link', { name: 'Request a reset link' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Reset password' })).not.toBeInTheDocument()
})

it('submits a valid reset link and new password', async () => {
  const fetchMock = vi.fn().mockResolvedValue(ok({ passwordReset: true }))
  vi.stubGlobal('fetch', fetchMock)
  const { router } = await renderApp(
    AuthPage,
    { mode: 'reset-password' },
    '/reset-password?email=alex%40example.com&code=abc',
  )
  await fireEvent.update(screen.getByLabelText('New password'), 'newSecret123')
  await fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
  await waitFor(() => expect(router.currentRoute.value.path).toBe('/login'))
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
    email: 'alex@example.com',
    code: 'abc',
    newPassword: 'newSecret123',
  })
})
