import { api } from '@/shared/api/client'
import type { NotificationSettings, TelegramAccount } from '@/entities'

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; refreshToken: string; expiration: string; userId: string; userName: string }>(
      '/api/auth/login',
      { email, password }
    ),

  // API field is "name", returns only { userId, userName } — no token
  register: (email: string, password: string, name: string) =>
    api.post<{ userId: string; userName: string }>('/api/auth/register', { email, password, name }),

  logout: (refreshToken: string) =>
    api.post<void>('/api/auth/logout', { refreshToken }),

  verifyEmail: (email: string, code: string) =>
    api.post<{ token: string; refreshToken: string; expiration: string; userId: string; userName: string }>(
      '/api/auth/verify-email',
      { email, code }
    ),

  resendVerification: (email: string) =>
    api.post<{ email: string; verificationCodeSent: boolean }>('/api/auth/resend-verification-code', { email }),

  forgotPassword: (email: string) =>
    api.post<{ email: string; resetRequested: boolean }>('/api/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<{ email: string; passwordReset: boolean }>('/api/auth/reset-password', { email, code, newPassword }),
}

// User
export const userApi = {
  me: () =>
    api.get<{ id: string; email: string; userName: string; roles: string[] }>('/api/users/me'),

  notificationSettings: () =>
    api.get<NotificationSettings>('/api/users/notification-settings'),

  updateNotificationSettings: (settings: Partial<NotificationSettings>) =>
    api.patch<NotificationSettings>('/api/users/notification-settings', settings),
}

// Telegram accounts
export interface TelegramAuthData {
  id: number
  first_name: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export const telegramApi = {
  list: () => api.get<TelegramAccount[]>('/api/telegram-accounts'),
  connect: (data: TelegramAuthData) => api.post<TelegramAccount>('/api/telegram-accounts', data),
  remove: (id: string) => api.delete<void>(`/api/telegram-accounts/${id}`),
}
