import { api } from '@/shared/api/client'
import type { NotificationSettings, TelegramAccount } from '@/entities'

export interface CurrentUser {
  id: string
  email: string
  userName: string
  roles: string[]
}

export const userApi = {
  me: () => api.get<CurrentUser>('/api/users/me'),

  notificationSettings: () =>
    api.get<NotificationSettings>('/api/users/notification-settings'),

  updateNotificationSettings: (settings: Partial<NotificationSettings>) =>
    api.patch<NotificationSettings>('/api/users/notification-settings', settings),
}

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
