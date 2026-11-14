<script setup lang="ts">
import Modal from './Modal.vue'
defineProps<{ open: boolean }>()
defineEmits<{ stay: []; discard: [] }>()
</script>
<template>
  <Modal
    :open="open"
    title="Unsaved changes"
    description="Your changes haven’t been saved. Stay to keep editing, or leave and discard them."
    @close="$emit('stay')"
    ><div class="mt-7 flex flex-wrap justify-end gap-3">
      <button type="button" class="btn btn-outline" @click="$emit('discard')">
        Discard and leave</button
      ><button type="button" class="btn" @click="$emit('stay')">Stay on this page</button>
    </div></Modal
  >
</template>
