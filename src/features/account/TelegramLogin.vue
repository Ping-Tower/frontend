<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { TelegramAuthData } from './api'
const emit = defineEmits<{ auth: [data: TelegramAuthData] }>()
const container = ref<HTMLDivElement>()
const username = import.meta.env.VITE_TELEGRAM_BOT_USERNAME
const callback = '__pingtowerTelegramAuth'
onMounted(() => {
  if (!username || !container.value) return
  ;(window as unknown as Record<string, unknown>)[callback] = (data: TelegramAuthData) =>
    emit('auth', data)
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.async = true
  for (const [key, value] of Object.entries({
    'data-telegram-login': username,
    'data-size': 'large',
    'data-onauth': `${callback}(user)`,
    'data-request-access': 'write',
  }))
    script.setAttribute(key, value)
  container.value.appendChild(script)
})
onBeforeUnmount(() => {
  delete (window as unknown as Record<string, unknown>)[callback]
  container.value?.replaceChildren()
})
</script>
<template>
  <div v-if="username" ref="container" />
  <p v-else class="text-sm text-muted">
    Telegram connection is not available right now. Email notifications are still available.
  </p>
</template>
