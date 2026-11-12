import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { NotificationSettings } from '@/entities'
import { userApi, telegramApi } from './api'
import type { TelegramAuthData } from './api'
import { notify } from '@/shared/lib/toast'
export const accountKeys = {
  me: ['me'] as const,
  notifications: ['notification-settings'] as const,
  telegram: ['telegram-accounts'] as const,
}
export function useMe() {
  return useQuery({ queryKey: accountKeys.me, queryFn: userApi.me })
}
export function useNotifications() {
  return useQuery({ queryKey: accountKeys.notifications, queryFn: userApi.notificationSettings })
}
export function useTelegram() {
  return useQuery({ queryKey: accountKeys.telegram, queryFn: telegramApi.list })
}
export function useSaveNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: NotificationSettings) => userApi.updateNotificationSettings(body),
    onSuccess: (data) => {
      qc.setQueryData(accountKeys.notifications, data)
      notify('Notification preferences saved.')
    },
  })
}
export function useConnectTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TelegramAuthData) => telegramApi.connect(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.telegram })
      notify('Telegram connected.')
    },
  })
}
export function useRemoveTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: telegramApi.remove,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.telegram })
      notify('Telegram account removed.')
    },
  })
}
