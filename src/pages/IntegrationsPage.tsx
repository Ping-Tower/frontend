import { useState } from 'react'
import { useConnectTelegram, useRemoveTelegram, useTelegramAccounts } from '@/features/account/hooks'
import { TelegramLoginButton } from '@/features/account/TelegramLoginButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { PageHeader } from '@/shared/ui/page-header'
import type { TelegramAccount } from '@/entities'

function telegramHandle(account: TelegramAccount) {
  return account.username ? `@${account.username}` : `ID ${account.telegramUserId}`
}

export function IntegrationsPage() {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { data: accounts, isLoading } = useTelegramAccounts()
  const { mutate: connect } = useConnectTelegram()
  const remove = useRemoveTelegram()

  const removingAccount = accounts?.find((a) => a.id === removingId)

  return (
    <>
      <div className="flex flex-col gap-5 p-6 sm:p-7 max-w-xl">
        <PageHeader
          title="Integrations"
          description="Manage connected services and notification channels."
        />

        <Card>
          <CardHeader>
            <CardTitle>Telegram accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {accounts?.length === 0 && (
                  <p className="text-muted font-alatsi text-base">
                    No Telegram accounts linked. Connect one to receive notifications.
                  </p>
                )}

                {accounts?.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between border border-white/12 rounded-[6px] px-4 py-3 bg-surface-panel"
                  >
                    <div className="flex flex-col">
                      <span className="font-alatsi text-stroke text-base">{telegramHandle(acc)}</span>
                      <span className="font-alatsi text-muted text-xs">
                        Connected {new Date(acc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="xs" variant="destructive" onClick={() => setRemovingId(acc.id)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="border-t border-white/7 pt-4">
                  <p className="font-alatsi text-sm text-muted mb-3">
                    Connect a Telegram account to receive server alerts:
                  </p>
                  <TelegramLoginButton onAuth={connect} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!removingId}
        title="Remove Telegram account"
        description={`Remove ${removingAccount ? telegramHandle(removingAccount) : 'this account'}? You won't receive notifications through it.`}
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={remove.isPending}
        destructive
        onConfirm={() => removingId && remove.mutate(removingId, { onSettled: () => setRemovingId(null) })}
        onCancel={() => setRemovingId(null)}
      />
    </>
  )
}
