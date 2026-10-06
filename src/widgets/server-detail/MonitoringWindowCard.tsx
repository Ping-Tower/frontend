import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { NativeSelect } from '@/shared/ui/native-select'
import {
  type BucketOption,
  type RefreshOption,
  BUCKET_OPTIONS,
  REFRESH_OPTIONS,
  WINDOW_OPTIONS,
} from './monitoring-window'
import type { MonitoringWindowState } from './useMonitoringWindow'

interface MonitoringWindowCardProps {
  window: MonitoringWindowState
  activeBucketSec: number
  children?: ReactNode
}

export function MonitoringWindowCard({ window: w, activeBucketSec, children }: MonitoringWindowCardProps) {
  const { customRangeDraft: draft, rangeMode, refreshOption, windowKey } = w
  const isPreset = rangeMode === 'preset'

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="flex flex-col gap-4 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Monitoring Window</CardTitle>
          <CardDescription>Date range, auto-refresh, and bucket size controls.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {WINDOW_OPTIONS.map((option) => (
            <Button
              key={option.key}
              size="xs"
              variant={isPreset && windowKey === option.key ? 'default' : 'outline'}
              className="shadow-none"
              onClick={() => w.resetToPreset(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 border-b border-white/7 pb-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-[8px] border border-white/8 bg-surface-control/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-alatsi text-[0.72rem] uppercase tracking-[0.08em] text-muted">Range</p>
              <p className="mt-1 text-sm text-stroke">{w.displayRange}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPreset ? 'up' : 'unknown'}>{isPreset ? 'Preset' : 'Custom'}</Badge>
              <Button size="xs" variant="outline" onClick={w.refreshNow}>Refresh now</Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <LabeledControl label="From">
              <Input
                type="datetime-local"
                className="h-11 text-sm"
                value={draft.from}
                onChange={(e) => w.setCustomRangeDraft({ ...draft, from: e.target.value })}
              />
            </LabeledControl>
            <LabeledControl label="To">
              <Input
                type="datetime-local"
                className="h-11 text-sm"
                value={draft.to}
                onChange={(e) => w.setCustomRangeDraft({ ...draft, to: e.target.value })}
              />
            </LabeledControl>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="xs" onClick={w.applyCustomRange} disabled={!w.isCustomRangeValid}>
              Apply range
            </Button>
            <Button size="xs" variant="outline" onClick={() => w.resetToPreset()}>
              Reset to preset
            </Button>
            {!w.isCustomRangeValid && draft.from && draft.to && (
              <span className="text-sm text-status-down">Invalid range.</span>
            )}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/8 bg-surface-control/80 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <LabeledControl label="Chart bucket">
              <NativeSelect
                className="h-11 w-full"
                value={w.bucketOption}
                onChange={(e) => w.setBucketOption(e.target.value as BucketOption)}
              >
                {BUCKET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </LabeledControl>
            <LabeledControl label="Auto-refresh">
              <NativeSelect
                className="h-11 w-full"
                value={refreshOption}
                onChange={(e) => w.setRefreshOption(e.target.value as RefreshOption)}
              >
                {REFRESH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </LabeledControl>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <StatTile label="Bucket" value={`${activeBucketSec}s`} />
            <StatTile label="Refresh" value={refreshOption === '0' ? 'Off' : `${refreshOption}s`} />
            <StatTile label="Mode" value={isPreset ? windowKey : 'Custom'} />
          </div>
        </div>
      </CardContent>
      {children}
    </Card>
  )
}

function LabeledControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-white/7 bg-surface-shell/80 p-3">
      <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className="mt-1.5 font-alatsi text-[1.05rem] text-stroke">{value}</p>
    </div>
  )
}
