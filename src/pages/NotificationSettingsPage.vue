<script setup lang="ts">
import DurationInput from '@/shared/ui/DurationInput.vue'
import { useUnsavedChanges } from '@/shared/composables/use-unsaved-changes'
import UnsavedChangesDialog from '@/shared/ui/UnsavedChangesDialog.vue'
import { computed, ref } from 'vue'
import {
  useMe,
  useNotifications,
  useSaveNotifications,
  useTelegram,
} from '@/features/account/queries'
import Feedback from '@/shared/ui/Feedback.vue'
const user = useMe(),
  settings = useNotifications(),
  telegram = useTelegram(),
  save = useSaveNotifications()
type Form = { onDown: boolean; onUp: boolean; onLatency: boolean; cooldownSec: string }
const initial = computed<Form>(() => ({
  onDown: settings.data.value?.onDown ?? true,
  onUp: settings.data.value?.onUp ?? true,
  onLatency: settings.data.value?.onLatency ?? true,
  cooldownSec: String(settings.data.value?.cooldownSec ?? 600),
}))
const draft = ref<Form | null>(null),
  form = computed(() => draft.value ?? initial.value)
const valid = computed(
  () =>
    form.value.cooldownSec.trim() !== '' &&
    Number.isSafeInteger(Number(form.value.cooldownSec)) &&
    Number(form.value.cooldownSec) >= 0,
)
const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(initial.value))
const unsaved = useUnsavedChanges(() => dirty.value)
const rules = [
  ['onDown', 'Server down', 'Alert when a target crosses its failure threshold.'],
  ['onUp', 'Server recovered', 'One message when the target comes back up.'],
  ['onLatency', 'Latency threshold', 'Alert when the response exceeds your target’s threshold.'],
] as const
function toggle(key: 'onDown' | 'onUp' | 'onLatency') {
  draft.value = { ...form.value, [key]: !form.value[key] }
}
function updateCooldown(value: string) {
  draft.value = { ...form.value, cooldownSec: value }
}
function submit() {
  if (valid.value && dirty.value)
    save.mutate(
      { ...form.value, cooldownSec: Number(form.value.cooldownSec) },
      {
        onSuccess: () => {
          draft.value = null
        },
      },
    )
}
function retry() {
  void user.refetch()
  void settings.refetch()
}
</script>
<template>
  <div class="page-content">
    <div>
      <p class="eyebrow mb-4">Only when it matters</p>
      <h1 class="page-title">Notifications</h1>
      <p class="mt-4 max-w-2xl text-muted">
        Decide what reaches you, and how long we wait before repeating an alert.
      </p>
    </div>
    <Feedback v-if="user.isError.value || settings.isError.value" @retry="retry" />
    <div v-else-if="user.isPending.value || settings.isPending.value" class="skeleton h-96" />
    <div v-else class="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section class="card">
        <h2 class="section-title">Alert rules</h2>
        <p class="mt-2 text-sm text-muted">These preferences apply to every monitor you own.</p>
        <form class="mt-6" @submit.prevent="submit">
          <button
            v-for="[key, title, description] in rules"
            :key="key"
            type="button"
            class="flex w-full items-start justify-between gap-5 border-t border-line py-6 text-left"
            :aria-pressed="form[key]"
            @click="toggle(key)"
          >
            <span
              ><span class="block font-medium">{{ title }}</span
              ><span class="mt-1 block text-sm text-muted">{{ description }}</span></span
            ><span class="status-badge" :class="{ 'bg-stroke text-surface-base': form[key] }">{{
              form[key] ? 'On' : 'Off'
            }}</span>
          </button>
          <DurationInput
            :model-value="form.cooldownSec"
            :invalid="!valid"
            @update:model-value="updateCooldown"
          />
          <p v-if="!valid" role="alert" class="field-error mt-3">
            Enter a duration of zero or more whole seconds.
          </p>
          <p v-if="save.error.value" role="alert" class="field-error mt-3">
            {{ save.error.value.message }}
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button class="btn" :disabled="!valid || !dirty || save.isPending.value">
              {{ save.isPending.value ? 'Saving…' : 'Save preferences' }}</button><button
              type="button"
              class="btn btn-outline"
              :disabled="!dirty || save.isPending.value"
              @click="draft = null"
            >
              Reset</button
            ><span v-if="dirty" class="text-xs text-muted">Unsaved changes.</span>
          </div>
        </form>
      </section>
      <aside class="space-y-6">
        <section class="card">
          <p class="eyebrow">Account</p>
          <h2 class="section-title mt-3">{{ user.data.value?.userName }}</h2>
          <p class="mt-3 text-sm text-muted break-all">{{ user.data.value?.email }}</p>
        </section>
        <section class="card">
          <h2 class="section-title">Delivery channels</h2>
          <div class="mt-6 border-t border-line py-4">
            <span class="font-medium">Email</span>
            <p class="mt-1 text-sm text-muted break-all">{{ user.data.value?.email }}</p>
          </div>
          <div class="border-t border-line py-4">
            <span class="font-medium">Telegram</span>
            <p class="mt-1 text-sm text-muted">
              {{
                telegram.isError.value
                  ? 'Could not check connection.'
                  : telegram.isPending.value
                    ? 'Checking…'
                    : telegram.data.value?.length
                      ? `${telegram.data.value.length} account(s) connected`
                      : 'No accounts connected'
              }}
            </p>
          </div>
          <RouterLink to="/app/settings/integrations" class="btn btn-outline btn-sm mt-3"
            >Manage integrations ↗</RouterLink
          >
        </section>
      </aside>
    </div>
  </div>
  <UnsavedChangesDialog
    :open="unsaved.open.value"
    @stay="unsaved.stay"
    @discard="unsaved.discard"
  />
</template>
