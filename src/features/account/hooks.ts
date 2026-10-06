import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { NotificationSettings } from '@/entities'
import { toastError } from '@/shared/lib/toast'
import { telegramApi, userApi, type TelegramAuthData } from './api'

export const accountKeys = {
  me: ['me'] as const,
  notificationSettings: ['notification-settings'] as const,
  telegramAccounts: ['telegram-accounts'] as const,
}

export function useMe() {
  return useQuery({ queryKey: accountKeys.me, queryFn: userApi.me })
}

export function useNotificationSettings() {
  return useQuery({ queryKey: accountKeys.notificationSettings, queryFn: userApi.notificationSettings })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) => userApi.updateNotificationSettings(settings),
    onSuccess: (next) => {
      qc.setQueryData(accountKeys.notificationSettings, next)
      toast.success('Notification settings saved')
    },
    onError: toastError,
  })
}

export function useTelegramAccounts() {
  return useQuery({ queryKey: accountKeys.telegramAccounts, queryFn: telegramApi.list })
}

export function useConnectTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TelegramAuthData) => telegramApi.connect(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.telegramAccounts })
      toast.success('Telegram account connected')
    },
    onError: toastError,
  })
}

export function useRemoveTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: telegramApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.telegramAccounts })
      toast.success('Telegram account removed')
    },
    onError: toastError,
  })
}
