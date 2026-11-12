<script setup lang="ts">
import type { ServerStatus } from '@/entities'
defineProps<{ status: ServerStatus; paused?: boolean }>()
</script>
<template>
  <svg class="status-symbol" viewBox="0 0 16 16" aria-hidden="true">
    <circle
      cx="8"
      cy="8"
      r="6.5"
      :fill="status === 'UP' && !paused ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.5"
      :stroke-dasharray="paused || status === 'UNKNOWN' ? '2.5 2.5' : undefined"
    />
    <path
      v-if="status === 'DOWN' && !paused"
      d="M3.5 12.5 12.5 3.5"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
</template>
