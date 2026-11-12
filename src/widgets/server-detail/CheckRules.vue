<script setup lang="ts">
import { computed, ref } from 'vue'
import { useServerSettings, useUpdateSettings } from '@/features/monitoring/queries'
import Feedback from '@/shared/ui/Feedback.vue'
const props = defineProps<{ serverId: string }>()
const { data: settings, isPending, isError, refetch } = useServerSettings(() => props.serverId)
const mutation = useUpdateSettings(() => props.serverId)
const fields = [
  ['intervalSec', 'Interval (sec)', 1],
  ['latencyThresholdMs', 'Latency threshold (ms)', 1],
  ['retries', 'Retries', 0],
  ['failureThreshold', 'Failure threshold', 1],
] as const
type Draft = Record<(typeof fields)[number][0], string>
const draft = ref<Draft | null>(null)
const form = computed(
  () =>
    draft.value ??
    (Object.fromEntries(
      fields.map(([key]) => [key, String(settings.value?.[key] ?? '')]),
    ) as Draft),
)
const valid = computed(() =>
  fields.every(
    ([key, , min]) =>
      form.value[key] === '' ||
      (Number.isSafeInteger(Number(form.value[key])) && Number(form.value[key]) >= min),
  ),
)
function update(key: keyof Draft, event: Event) {
  draft.value = { ...form.value, [key]: (event.target as HTMLInputElement).value }
}
function save() {
  if (valid.value && draft.value)
    mutation.mutate(
      Object.fromEntries(
        fields.map(([key]) => [key, form.value[key] === '' ? null : Number(form.value[key])]),
      ),
      {
        onSuccess: () => {
          draft.value = null
        },
      },
    )
}
</script>
<template>
  <div v-if="isPending" class="skeleton h-56" />
  <Feedback v-else-if="isError" @retry="refetch()" />
  <section v-else class="card">
    <h2 class="section-title">Ping Settings</h2>
    <p class="mt-2 text-sm text-muted">
      Check interval, latency threshold, retries and failure sensitivity. Leave a value empty to use
      the default.
    </p>
    <form class="mt-7" @submit.prevent="save">
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <label v-for="[key, label, min] in fields" :key="key" class="field"
          ><span>{{ label }}</span
          ><input
            :value="form[key]"
            class="input"
            type="number"
            :min="min"
            step="1"
            @input="update(key, $event)"
        /></label>
      </div>
      <p v-if="!valid" role="alert" class="mt-4 field-error">
        Use positive whole numbers. Retries can be zero.
      </p>
      <p v-if="mutation.error.value" role="alert" class="mt-4 field-error">
        {{ mutation.error.value.message }}
      </p>
      <div v-if="draft" class="mt-6 flex gap-3">
        <button class="btn btn-sm" :disabled="!valid || mutation.isPending.value">
          {{ mutation.isPending.value ? 'Saving…' : 'Save settings' }}</button><button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="mutation.isPending.value"
          @click="draft = null"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
</template>
