<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { loadTelegramLogin } from './telegram-login'
import type { TelegramLoginSdk } from './telegram-login'
import type { TelegramAuthData } from './api'
defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ auth: [data: TelegramAuthData] }>()
const username = import.meta.env.VITE_TELEGRAM_BOT_USERNAME
const botId = Number(import.meta.env.VITE_TELEGRAM_BOT_ID)
const sdk = ref<TelegramLoginSdk>(),
  error = ref(''),
  opening = ref(false),
  loading = ref(false)
let disposed = false
async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await loadTelegramLogin()
    if (!disposed) sdk.value = result
  } catch (e) {
    if (!disposed)
      error.value = e instanceof Error ? e.message : 'Could not load Telegram. Try again.'
  } finally {
    if (!disposed) loading.value = false
  }
}
onMounted(() => {
  if (username && botId) void load()
})
onBeforeUnmount(() => {
  disposed = true
})
function connect() {
  if (!sdk.value) return
  error.value = ''
  opening.value = true
  try {
    // Call synchronously from the click so browsers allow Telegram's own OAuth popup.
    sdk.value.auth({ bot_id: botId, request_access: 'write' }, (data) => {
      if (disposed) return
      opening.value = false
      if (data) emit('auth', data)
    })
  } catch {
    opening.value = false
    error.value = 'Could not open Telegram. Allow popups for this site and try again.'
  }
}
</script>
<template>
  <div v-if="username && botId" class="space-y-3">
    <button
      type="button"
      class="btn gap-3"
      :disabled="loading || busy"
      @click="sdk ? connect() : load()"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m21 3-4 18-6-6-4 3 1-6L21 3ZM8 12l9-6-6 9"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        /></svg
      >{{
        loading
          ? 'Loading Telegram…'
          : busy
            ? 'Connecting…'
            : error && !sdk
              ? 'Try Telegram again'
              : 'Connect Telegram'
      }}<span aria-hidden="true">↗</span>
    </button>
    <p v-if="opening" role="status" class="text-xs text-muted">
      Complete the connection in Telegram’s window. If it didn’t open, allow popups and try again.
    </p>
    <p v-if="error" role="alert" class="field-error">{{ error }}</p>
    <p v-else class="text-xs text-muted">Continue securely with @{{ username }}.</p>
  </div>
  <p v-else class="text-sm text-muted">
    Telegram connection is not available right now. Email notifications are still available.
  </p>
</template>
