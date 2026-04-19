import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { telegramApi, type TelegramAuthData } from '@/features/auth/api'
import { TelegramLoginButton } from '@/features/auth/components/TelegramLoginButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import type { TelegramAccount } from '@/entities'

export function IntegrationsPage() {
  const qc = useQueryClient()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['telegram-accounts'],
    queryFn: telegramApi.list,
  })

  const connect = useMutation({
    mutationFn: (data: TelegramAuthData) => telegramApi.connect(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram-accounts'] })
      toast.success('Telegram account connected')
    },
    onError: (e) => toast.error((e as Error).message),
  })

  const remove = useMutation({
    mutationFn: telegramApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram-accounts'] })
      toast.success('Telegram account removed')
      setRemovingId(null)
    },
    onError: (e) => {
      toast.error((e as Error).message)
      setRemovingId(null)
    },
  })

  const handleAuth = useCallback(
    (data: TelegramAuthData) => connect.mutate(data),
    [connect]
  )

  const removingAccount = accounts?.find((a) => a.id === removingId)

  return (
    <>
      <div className="flex flex-col gap-5 p-6 sm:p-7 max-w-xl">
        <div>
          <p className="font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">Settings</p>
          <h1 className="mt-1.5 font-alatsi text-[1.5rem] font-bold tracking-[-0.03em] text-stroke leading-none">Integrations</h1>
          <p className="mt-1.5 font-sans text-[0.82rem] text-muted">Manage connected services and notification channels.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Telegram accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {accounts?.length === 0 && (
                  <p className="text-muted font-alatsi text-base">
                    No Telegram accounts linked. Connect one to receive notifications.
                  </p>
                )}

                {accounts?.map((acc: TelegramAccount) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between border border-white/12 rounded-[6px] px-4 py-3 bg-surface-panel"
                  >
                    <div className="flex flex-col">
                      <span className="font-alatsi text-stroke text-base">
                        {acc.username ? `@${acc.username}` : `ID ${acc.telegramUserId}`}
                      </span>
                      <span className="font-alatsi text-muted text-xs">
                        Connected {new Date(acc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => setRemovingId(acc.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="border-t border-white/7 pt-4">
                  <p className="font-alatsi text-sm text-muted mb-3">
                    Connect a Telegram account to receive server alerts:
                  </p>
                  <TelegramLoginButton onAuth={handleAuth} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!removingId}
        title="Remove Telegram account"
        description={`Remove ${removingAccount?.username ? `@${removingAccount.username}` : 'this account'}? You won't receive notifications through it.`}
        confirmLabel="Remove"
        isPending={remove.isPending}
        destructive
        onConfirm={() => removingId && remove.mutate(removingId)}
        onCancel={() => setRemovingId(null)}
      />
    </>
  )
}
