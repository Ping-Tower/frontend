<script setup lang="ts">
import type { ServerStatus } from '@/entities'
import StatusSymbol from './StatusSymbol.vue'
defineProps<{ status: ServerStatus; paused?: boolean }>()
</script>
<template>
  <span class="status-badge"
    ><StatusSymbol :status="status" :paused="paused" />{{
      paused ? 'Paused' : status === 'UP' ? 'Up' : status === 'DOWN' ? 'Down' : 'Unknown'
    }}</span
  >
</template>
