<script setup lang="ts">
import type { ReturnTypeWindow } from './window-types'
import { BUCKET_OPTIONS, REFRESH_OPTIONS, WINDOW_OPTIONS } from './monitoring-window'
const emit = defineEmits<{ refresh: [] }>()
const props = defineProps<{ window: ReturnTypeWindow }>()
// The composable is a controller owned by the page; writable refs are its public interface.
const controls = props.window
function refreshNow() {
  controls.refreshNow()
  emit('refresh')
}
</script>
<template>
  <section class="card">
    <div class="flex flex-wrap items-center justify-between gap-5">
      <div>
        <p class="eyebrow">Monitoring window</p>
        <h2 class="section-title mt-2">A closer look.</h2>
      </div>
      <div class="segmented" role="group" aria-label="Time range">
        <button
          v-for="option in WINDOW_OPTIONS"
          :key="option.key"
          :aria-pressed="!window.custom.value && window.preset.value === option.key"
          @click="window.select(option.key)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <label class="field"
        ><span>From</span
        ><input
          v-model="controls.fromDraft.value"
          type="datetime-local"
          class="input !text-xs" /></label
      ><label class="field"
        ><span>To</span
        ><input
          v-model="controls.toDraft.value"
          type="datetime-local"
          class="input !text-xs" /></label
      ><label class="field"
        ><span>Chart bucket</span
        ><select v-model="controls.bucket.value" class="input">
          <option v-for="option in BUCKET_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select></label
      ><label class="field"
        ><span>Auto-refresh</span
        ><select v-model="controls.refresh.value" class="input">
          <option v-for="option in REFRESH_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select></label
      >
    </div>
    <div class="mt-5 flex flex-wrap items-center gap-3">
      <button class="btn btn-sm" :disabled="!window.valid.value" @click="window.apply">
        Apply range</button
      ><button class="btn btn-outline btn-sm" @click="window.select(window.preset.value)">
        Reset to preset</button
      ><button class="btn btn-outline btn-sm" @click="refreshNow">Refresh now</button
      ><span v-if="!window.valid.value" role="alert" class="text-xs">From must be before To.</span
      ><span class="font-mono text-xs text-muted"
        >{{ window.custom.value ? 'Custom range' : 'Rolling window' }} ·
        {{ window.filters.value.bucketSec }}s buckets</span
      >
    </div>
  </section>
</template>
