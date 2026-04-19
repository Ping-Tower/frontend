import { useEffect, useMemo, useState } from 'react'
import {
  type BucketOption,
  formatDateRange,
  parseDateTimeLocalValue,
  type RangeMode,
  type RefreshOption,
  toDateTimeLocalValue,
  type WindowKey,
  WINDOW_OPTIONS,
} from './monitoring-window'

interface MonitoringWindowState {
  activeBucketSec: number
  bucketOption: BucketOption
  customRangeDraft: { from: string; to: string }
  displayRange: string
  isCustomRangeValid: boolean
  overviewFilters: { from: string; to: string; bucketSec: number }
  baselineFilters: { from: string; to: string }
  metricsRefetchInterval: number | false
  rangeMode: RangeMode
  refreshOption: RefreshOption
  windowKey: WindowKey
  setBucketOption: (value: BucketOption) => void
  setRefreshOption: (value: RefreshOption) => void
  setCustomRangeDraft: (draft: { from: string; to: string }) => void
  applyCustomRange: () => void
  refreshNow: () => void
  resetToPreset: (nextWindowKey?: WindowKey) => void
}

export function useMonitoringWindow(intervalSec: number | null | undefined): MonitoringWindowState {
  const [windowKey, setWindowKey] = useState<WindowKey>('2h')
  const [rangeMode, setRangeMode] = useState<RangeMode>('preset')
  const [bucketOption, setBucketOption] = useState<BucketOption>('auto')
  const [refreshOption, setRefreshOption] = useState<RefreshOption>('30')
  const [liveNow, setLiveNow] = useState(() => Date.now())
  const [customRangeDraft, setCustomRangeDraft] = useState(() => {
    const now = new Date()
    const from = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    return {
      from: toDateTimeLocalValue(from),
      to: toDateTimeLocalValue(now),
    }
  })
  const [customRangeApplied, setCustomRangeApplied] = useState(() => customRangeDraft)

  const refreshMs = Number(refreshOption) * 1000
  const selectedWindow = WINDOW_OPTIONS.find((option) => option.key === windowKey) ?? WINDOW_OPTIONS[1]

  useEffect(() => {
    if (refreshMs <= 0 || rangeMode !== 'preset') return

    const timer = window.setInterval(() => setLiveNow(Date.now()), refreshMs)
    return () => window.clearInterval(timer)
  }, [rangeMode, refreshMs])

  const overviewFilters = useMemo(() => {
    const probeIntervalSec = intervalSec ?? 10
    const to = rangeMode === 'preset' ? new Date(liveNow) : new Date(customRangeApplied.to)
    const from = rangeMode === 'preset' ? new Date(to.getTime() - selectedWindow.ms) : new Date(customRangeApplied.from)
    const rangeMs = Math.max(1000, to.getTime() - from.getTime())
    const autoBucketSec = Math.max(1, Math.ceil(rangeMs / 1000 / 180))

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      bucketSec: bucketOption === 'auto' ? Math.max(probeIntervalSec, autoBucketSec) : Number(bucketOption),
    }
  }, [bucketOption, customRangeApplied.from, customRangeApplied.to, intervalSec, liveNow, rangeMode, selectedWindow.ms])

  const baselineFilters = useMemo(() => {
    const to = overviewFilters.to
    const from = new Date(new Date(to).getTime() - 24 * 60 * 60 * 1000).toISOString()

    return { from, to }
  }, [overviewFilters.to])

  const parsedFrom = parseDateTimeLocalValue(customRangeDraft.from)
  const parsedTo = parseDateTimeLocalValue(customRangeDraft.to)
  const isCustomRangeValid = parsedFrom !== null && parsedTo !== null && parsedFrom.getTime() < parsedTo.getTime()
  const metricsRefetchInterval = rangeMode === 'custom' && refreshMs > 0 ? refreshMs : false

  function applyCustomRange() {
    if (!isCustomRangeValid || !parsedFrom || !parsedTo) return

    setRangeMode('custom')
    setCustomRangeApplied({
      from: parsedFrom.toISOString(),
      to: parsedTo.toISOString(),
    })
  }

  function refreshNow() {
    window.setTimeout(() => setLiveNow(Date.now()), 0)
  }

  function resetToPreset(nextWindowKey?: WindowKey) {
    const resolvedKey = nextWindowKey ?? windowKey
    const presetWindow = WINDOW_OPTIONS.find((option) => option.key === resolvedKey) ?? selectedWindow
    const now = new Date()

    setCustomRangeDraft({
      from: toDateTimeLocalValue(new Date(now.getTime() - presetWindow.ms)),
      to: toDateTimeLocalValue(now),
    })
    setRangeMode('preset')

    if (nextWindowKey) {
      setWindowKey(nextWindowKey)
    }

    refreshNow()
  }

  return {
    activeBucketSec: overviewFilters.bucketSec,
    bucketOption,
    customRangeDraft,
    displayRange: formatDateRange(overviewFilters.from, overviewFilters.to),
    isCustomRangeValid,
    overviewFilters,
    baselineFilters,
    metricsRefetchInterval,
    rangeMode,
    refreshOption,
    windowKey,
    setBucketOption,
    setRefreshOption,
    setCustomRangeDraft,
    applyCustomRange,
    refreshNow,
    resetToPreset,
  }
}
