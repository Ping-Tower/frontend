<script setup lang="ts">
withDefaults(defineProps<{ title?: string }>(), { title: 'Could not load this data.' })
defineEmits<{ retry: [] }>()
</script>
<template>
  <div role="alert" class="card">
    <h2 class="text-2xl">{{ title }}</h2>
    <p class="mt-2 text-muted">Check your connection and try again.</p>
    <button class="btn btn-outline mt-5" @click="$emit('retry')">Try again</button>
  </div>
</template>
