<script setup lang="ts">
import { notifications, dismiss } from '@/shared/lib/toast'
</script>
<template>
  <div class="toast-stack" aria-live="polite">
    <div v-for="item in notifications" :key="item.id" class="toast">
      <span>{{ item.message }}</span><button
        class="text-muted"
        aria-label="Dismiss notification"
        @click="dismiss(item.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>
