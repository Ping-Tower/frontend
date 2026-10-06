import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { NotificationSettings } from '@/entities'
import {
  useMe,
  useNotificationSettings,
  useTelegramAccounts,
  useUpdateNotificationSettings,
} from '@/features/account/hooks'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

type NotificationSettingsForm = {
  onDown: boolean
  onUp: boolean
  onLatency: boolean
  cooldownSec: string
}

const DEFAULT_SETTINGS: NotificationSettings = {
  onDown: true,
  onUp: true,
  onLatency: true,
  cooldownSec: 600,
}

function toForm(settings?: NotificationSettings | null): NotificationSettingsForm {
  const resolved = { ...DEFAULT_SETTINGS, ...settings }

  return {
    onDown: resolved.onDown ?? true,
    onUp: resolved.onUp ?? true,
    onLatency: resolved.onLatency ?? true,
    cooldownSec: String(resolved.cooldownSec ?? 600),
  }
}

export function NotificationSettingsPage() {
  const navigate = useNavigate()
  const { data: user, isLoading: isUserLoading } = useMe()
  const { data: settings, isLoading: isSettingsLoading } = useNotificationSettings()
  const { data: telegramAccounts, isLoading: isTelegramLoading } = useTelegramAccounts()
  const updateSettings = useUpdateNotificationSettings()

  const initialForm = useMemo(() => toForm(settings), [settings])
  // Local edits on top of the server state; null means "nothing changed".
  const [draft, setDraft] = useState<NotificationSettingsForm | null>(null)
  const form = draft ?? initialForm

  function patchForm(patch: Partial<NotificationSettingsForm>) {
    setDraft({ ...form, ...patch })
  }

  const cooldownValue = Number(form.cooldownSec)
  const isCooldownValid = form.cooldownSec.trim() !== '' && Number.isFinite(cooldownValue) && cooldownValue >= 0
  const isDirty =
    form.onDown !== initialForm.onDown ||
    form.onUp !== initialForm.onUp ||
    form.onLatency !== initialForm.onLatency ||
    form.cooldownSec !== initialForm.cooldownSec

  function save() {
    updateSettings.mutate(
      {
        onDown: form.onDown,
        onUp: form.onUp,
        onLatency: form.onLatency,
        cooldownSec: Number(form.cooldownSec),
      },
      { onSuccess: () => setDraft(null) }
    )
  }

  const connectedTelegramAccounts = telegramAccounts?.length ?? 0
  const isLoading = isUserLoading || isSettingsLoading

  return (
    <div className="flex w-full flex-col gap-5 p-6 sm:p-7">
      <PageHeader
        title="Notifications"
        description="Decide which server events can wake you up, and how long the system should wait before repeating the same alert."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card className="p-5 sm:p-6">
          <CardHeader>
            <CardTitle>Alert Rules</CardTitle>
            <CardDescription>
              These rules apply to every target you own. Channel delivery depends on your connected email and Telegram accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <RuleRow
                  title="Server down"
                  description="Alert when a target crosses its failure threshold and enters DOWN."
                  enabled={form.onDown}
                  onToggle={() => patchForm({ onDown: !form.onDown })}
                />
                <RuleRow
                  title="Server recovered"
                  description="Alert when the target recovers and comes back to UP."
                  enabled={form.onUp}
                  onToggle={() => patchForm({ onUp: !form.onUp })}
                />
                <RuleRow
                  title="Latency threshold"
                  description="Alert when latency breaks the target-level threshold you configured on the server."
                  enabled={form.onLatency}
                  onToggle={() => patchForm({ onLatency: !form.onLatency })}
                />

                <div className="rounded-[6px] border border-white/7 bg-surface-control p-4">
                  <label className="text-sm font-semibold text-stroke" htmlFor="cooldownSec">
                    Cooldown (seconds)
                  </label>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    While cooldown is active, repeated events of the same type do not trigger extra notifications.
                  </p>
                  <div className="mt-4 max-w-sm">
                    <Input
                      id="cooldownSec"
                      type="number"
                      min={0}
                      value={form.cooldownSec}
                      onChange={(event) => patchForm({ cooldownSec: event.target.value })}
                    />
                  </div>
                  {!isCooldownValid && (
                    <p className="mt-2 text-sm text-status-down">Cooldown must be a non-negative number.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    onClick={save}
                    disabled={!isDirty || !isCooldownValid || updateSettings.isPending}
                  >
                    {updateSettings.isPending ? 'Saving...' : 'Save preferences'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft(null)}
                    disabled={!isDirty || updateSettings.isPending}
                  >
                    Reset
                  </Button>
                  {isDirty && <span className="text-sm text-muted">You have unsaved changes.</span>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Current owner and primary destinations for alert delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[6px] border border-white/7 bg-surface-control p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">User</p>
                    <p className="mt-2 text-lg font-semibold text-stroke">{user?.userName}</p>
                  </div>
                  <div className="rounded-[6px] border border-white/7 bg-surface-control p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Email</p>
                    <p className="mt-2 break-all text-lg font-semibold text-stroke">{user?.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
              <CardDescription>Each connected channel becomes an available destination for alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChannelRow
                title="Email"
                value={user?.email ?? 'Primary mailbox'}
                status="Connected"
                tone="up"
              />

              {isTelegramLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <ChannelRow
                  title="Telegram"
                  value={
                    connectedTelegramAccounts > 0
                      ? `${connectedTelegramAccounts} account${connectedTelegramAccounts > 1 ? 's' : ''} connected`
                      : 'No Telegram accounts connected'
                  }
                  status={connectedTelegramAccounts > 0 ? 'Connected' : 'Not connected'}
                  tone={connectedTelegramAccounts > 0 ? 'up' : 'unknown'}
                />
              )}

              <div className="rounded-[6px] border border-dashed border-white/12 bg-surface-panel p-4">
                <p className="text-sm leading-6 text-muted">
                  Telegram linkage stays in Integrations because every linked account can receive the same alert stream.
                </p>
                <Button
                  className="mt-4"
                  size="xs"
                  variant="outline"
                  onClick={() => navigate('/app/settings/integrations')}
                >
                  Manage integrations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RuleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-4 rounded-[6px] border border-white/7 bg-surface-control p-4 text-left transition-colors hover:bg-surface-elevated"
      aria-pressed={enabled}
    >
      <div>
        <p className="text-base font-semibold text-stroke">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <span
        className={`mt-1 inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
          enabled
            ? 'bg-status-up-bg text-status-up'
            : 'bg-status-unknown-bg text-status-unknown'
        }`}
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </button>
  )
}

function ChannelRow({
  title,
  value,
  status,
  tone,
}: {
  title: string
  value: string
  status: string
  tone: 'up' | 'unknown'
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[6px] border border-white/7 bg-surface-control p-4">
      <div>
        <p className="text-base font-semibold text-stroke">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{value}</p>
      </div>
      <Badge variant={tone}>{status}</Badge>
    </div>
  )
}
