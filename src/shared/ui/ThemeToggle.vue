<script setup lang="ts">
import { useTheme, toggleTheme } from '@/shared/lib/theme'
const theme = useTheme()
</script>
<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="theme === 'dark' ? 'Light theme' : 'Dark theme'"
    @click="toggleTheme"
  >
    <svg
      v-if="theme === 'dark'"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </svg>
    <svg
      v-else
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="M20.7 13A9 9 0 0 1 11 3.3 9 9 0 1 0 20.7 13Z" />
    </svg>
    <span>{{ theme === 'dark' ? 'Light theme' : 'Dark theme' }}</span>
  </button>
</template>
