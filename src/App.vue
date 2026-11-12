<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useRealtime } from '@/features/monitoring/use-realtime'
import Toasts from '@/shared/ui/Toasts.vue'
useRealtime()
const failed = ref(false)
onErrorCaptured(() => {
  failed.value = true
  return false
})
function reload() {
  window.location.reload()
}
</script>
<template>
  <div v-if="failed" class="app-shell justify-center gap-5">
    <h1 class="page-title">Something went wrong.</h1>
    <p class="text-muted">Reload the page to try again.</p>
    <button class="btn w-fit" @click="reload">Reload page</button>
  </div>
  <RouterView v-else />
  <Toasts />
</template>
