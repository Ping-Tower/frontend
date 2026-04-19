import { useState } from 'react'
import { useServerSettings, useUpdateServerSettings } from '@/features/monitoring/hooks'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

interface SettingsTabProps {
  serverId: string
}

export function SettingsTab({ serverId }: SettingsTabProps) {
  const { data: settings } = useServerSettings(serverId)
  const updateSettings = useUpdateServerSettings(serverId)
  const [form, setForm] = useState<{
    intervalSec: string
    latencyThresholdMs: string
    retries: string
    failureThreshold: string
  } | null>(null)

  const settingsForm = form ?? {
    intervalSec: String(settings?.intervalSec ?? ''),
    latencyThresholdMs: String(settings?.latencyThresholdMs ?? ''),
    retries: String(settings?.retries ?? ''),
    failureThreshold: String(settings?.failureThreshold ?? ''),
  }

  function saveSettings() {
    if (!form) return
    updateSettings.mutate(
      {
        intervalSec: form.intervalSec ? Number(form.intervalSec) : null,
        latencyThresholdMs: form.latencyThresholdMs ? Number(form.latencyThresholdMs) : null,
        retries: form.retries ? Number(form.retries) : null,
        failureThreshold: form.failureThreshold ? Number(form.failureThreshold) : null,
      },
      { onSuccess: () => setForm(null) }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ping Settings</CardTitle>
        <CardDescription>
          Configure check interval, latency threshold, retries, and failure sensitivity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ['intervalSec', 'Interval (sec)'],
              ['latencyThresholdMs', 'Latency threshold (ms)'],
              ['retries', 'Retries'],
              ['failureThreshold', 'Failure threshold'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm text-muted">{label}</label>
              <Input
                type="number"
                className="h-12 text-base"
                value={settingsForm[key]}
                onChange={(e) => setForm({ ...settingsForm, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        {form && (
          <div className="mt-4 flex items-center gap-3">
            <Button size="xs" onClick={saveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Saving...' : 'Save settings'}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
