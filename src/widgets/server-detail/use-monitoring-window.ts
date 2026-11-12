import { computed, ref, watch, onScopeDispose } from 'vue'
import {
  WINDOW_OPTIONS,
  isValidRange,
  parseDateTimeLocalValue,
  toDateTimeLocalValue,
} from './monitoring-window'
import type { WindowKey, BucketOption, RefreshOption } from './monitoring-window'
export function useMonitoringWindow(interval: () => number | null | undefined) {
  const preset = ref<WindowKey>('2h'),
    bucket = ref<BucketOption>('auto'),
    refresh = ref<RefreshOption>('30'),
    custom = ref(false),
    now = ref(Date.now())
  const fromDraft = ref(toDateTimeLocalValue(new Date(now.value - 7200000))),
    toDraft = ref(toDateTimeLocalValue(new Date(now.value)))
  const applied = ref({ from: '', to: '' })
  const valid = computed(() =>
    isValidRange(parseDateTimeLocalValue(fromDraft.value), parseDateTimeLocalValue(toDraft.value)),
  )
  let timer: ReturnType<typeof setInterval> | undefined
  watch(
    [refresh, custom],
    () => {
      clearInterval(timer)
      if (Number(refresh.value) > 0 && !custom.value)
        timer = setInterval(
          () => {
            now.value = Date.now()
          },
          Number(refresh.value) * 1000,
        )
    },
    { immediate: true },
  )
  onScopeDispose(() => clearInterval(timer))
  const filters = computed(() => {
    const duration = WINDOW_OPTIONS.find((w) => w.key === preset.value)!.ms
    const to = custom.value ? new Date(applied.value.to) : new Date(now.value),
      from = custom.value ? new Date(applied.value.from) : new Date(now.value - duration)
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      bucketSec:
        bucket.value === 'auto'
          ? Math.max(interval() ?? 10, Math.ceil((to.getTime() - from.getTime()) / 180000))
          : Number(bucket.value),
    }
  })
  function apply() {
    if (!valid.value) return
    applied.value = {
      from: new Date(fromDraft.value).toISOString(),
      to: new Date(toDraft.value).toISOString(),
    }
    custom.value = true
  }
  function select(key: WindowKey) {
    preset.value = key
    custom.value = false
    now.value = Date.now()
  }
  function refreshNow() {
    now.value = Date.now()
  }
  return {
    preset,
    bucket,
    refresh,
    custom,
    fromDraft,
    toDraft,
    valid,
    filters,
    apply,
    select,
    refreshNow,
  }
}
