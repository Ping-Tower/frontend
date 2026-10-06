import { api } from '@/shared/api/client'
import type { AuthSession } from '@/entities'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthSession>('/api/auth/login', { email, password }),

  // API field is "name", returns only { userId, userName } — no token
  register: (email: string, password: string, name: string) =>
    api.post<{ userId: string; userName: string }>('/api/auth/register', { email, password, name }),

  logout: (refreshToken: string) =>
    api.post<void>('/api/auth/logout', { refreshToken }),

  verifyEmail: (email: string, code: string) =>
    api.post<AuthSession>('/api/auth/verify-email', { email, code }),

  resendVerification: (email: string) =>
    api.post<{ email: string; verificationCodeSent: boolean }>('/api/auth/resend-verification-code', { email }),

  forgotPassword: (email: string) =>
    api.post<{ email: string; resetRequested: boolean }>('/api/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<{ email: string; passwordReset: boolean }>('/api/auth/reset-password', { email, code, newPassword }),
}
