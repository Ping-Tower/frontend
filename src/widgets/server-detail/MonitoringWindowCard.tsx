import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import {
  type BucketOption,
  type RangeMode,
  type RefreshOption,
  type WindowKey,
  WINDOW_OPTIONS,
} from './monitoring-window'

interface MonitoringWindowCardProps {
  children?: ReactNode
  windowKey: WindowKey
  rangeMode: RangeMode
  bucketOption: BucketOption
  refreshOption: RefreshOption
  customRangeDraft: { from: string; to: string }
  activeBucketSec: number
  displayRange: string
  isCustomRangeValid: boolean
  onPreset: (key: WindowKey) => void
  onRefreshNow: () => void
  onDraftChange: (draft: { from: string; to: string }) => void
  onApplyRange: () => void
  onResetToPreset: () => void
  onBucketChange: (v: BucketOption) => void
  onRefreshChange: (v: RefreshOption) => void
}

export function MonitoringWindowCard({
  windowKey,
  rangeMode,
  bucketOption,
  refreshOption,
  customRangeDraft,
  activeBucketSec,
  displayRange,
  isCustomRangeValid,
  onPreset,
  onRefreshNow,
  onDraftChange,
  onApplyRange,
  onResetToPreset,
  onBucketChange,
  onRefreshChange,
  children,
}: MonitoringWindowCardProps) {
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
              variant={rangeMode === 'preset' && windowKey === option.key ? 'default' : 'outline'}
              className="shadow-none"
              onClick={() => onPreset(option.key)}
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
              <p className="mt-1 text-sm text-stroke">{displayRange}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={rangeMode === 'preset' ? 'up' : 'unknown'}>
                {rangeMode === 'preset' ? 'Preset' : 'Custom'}
              </Badge>
              <Button size="xs" variant="outline" onClick={onRefreshNow}>Refresh now</Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted">From</label>
              <Input
                type="datetime-local"
                className="h-11 text-sm"
                value={customRangeDraft.from}
                onChange={(e) => onDraftChange({ ...customRangeDraft, from: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted">To</label>
              <Input
                type="datetime-local"
                className="h-11 text-sm"
                value={customRangeDraft.to}
                onChange={(e) => onDraftChange({ ...customRangeDraft, to: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="xs" onClick={onApplyRange} disabled={!isCustomRangeValid}>
              Apply range
            </Button>
            <Button size="xs" variant="outline" onClick={onResetToPreset}>
              Reset to preset
            </Button>
            {!isCustomRangeValid && customRangeDraft.from && customRangeDraft.to && (
              <span className="text-sm text-status-down">Invalid range.</span>
            )}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/8 bg-surface-control/80 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted">Chart bucket</label>
              <select
                className="flex h-11 w-full rounded-[6px] border border-white/7 bg-surface-panel px-3 font-alatsi text-sm text-stroke focus:outline-none focus:border-brand/40"
                value={bucketOption}
                onChange={(e) => onBucketChange(e.target.value as BucketOption)}
              >
                <option value="auto">Auto</option>
                <option value="5">5 sec</option>
                <option value="10">10 sec</option>
                <option value="30">30 sec</option>
                <option value="60">1 min</option>
                <option value="120">2 min</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted">Auto-refresh</label>
              <select
                className="flex h-11 w-full rounded-[6px] border border-white/7 bg-surface-panel px-3 font-alatsi text-sm text-stroke focus:outline-none focus:border-brand/40"
                value={refreshOption}
                onChange={(e) => onRefreshChange(e.target.value as RefreshOption)}
              >
                <option value="0">Off</option>
                <option value="5">5 sec</option>
                <option value="10">10 sec</option>
                <option value="30">30 sec</option>
                <option value="60">1 min</option>
                <option value="120">2 min</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-[6px] border border-white/7 bg-surface-shell/80 p-3">
              <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">Bucket</p>
              <p className="mt-1.5 font-alatsi text-[1.05rem] text-stroke">{activeBucketSec}s</p>
            </div>
            <div className="rounded-[6px] border border-white/7 bg-surface-shell/80 p-3">
              <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">Refresh</p>
              <p className="mt-1.5 font-alatsi text-[1.05rem] text-stroke">{refreshOption === '0' ? 'Off' : `${refreshOption}s`}</p>
            </div>
            <div className="rounded-[6px] border border-white/7 bg-surface-shell/80 p-3">
              <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">Mode</p>
              <p className="mt-1.5 font-alatsi text-[1.05rem] text-stroke">{rangeMode === 'preset' ? windowKey : 'Custom'}</p>
            </div>
          </div>
        </div>
      </CardContent>
      {children}
    </Card>
  )
}
