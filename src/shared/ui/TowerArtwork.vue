<template>
  <svg class="tower-art" viewBox="0 0 440 280" fill="none" aria-hidden="true">
    <circle cx="220" cy="140" r="116" stroke="currentColor" />
    <path d="M138 222 302 58" stroke="currentColor" />
    <path d="M220 24a116 116 0 0 1 82 198L138 58a116 116 0 0 1 82-34" fill="currentColor" />
    <path
      v-for="y in [70, 98, 126, 154, 182, 210]"
      :key="y"
      :d="`M188 ${y}h64`"
      stroke="var(--color-surface-base)"
      stroke-width="2"
    />
    <path d="M188 50v180M252 50v180" stroke="var(--color-surface-base)" stroke-width="2" />
    <path d="M24 140h48M368 140h48M220 0v12M220 268v12" stroke="currentColor" />
  </svg>
</template>
