<script setup lang="ts">
withDefaults(defineProps<{ to?: string }>(), { to: '/' })
</script>
<template>
  <RouterLink :to="to" class="brand"
    ><img src="/brand-mark.png" alt="" /><span>PingTower</span></RouterLink
  >
</template>
