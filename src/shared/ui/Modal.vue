<script setup lang="ts">
import { ref, watch, onMounted, useId } from 'vue'
const props = defineProps<{ open: boolean; title: string; description?: string; busy?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const titleId = useId(),
  descriptionId = useId()
function sync() {
  if (props.open && !dialog.value?.open) dialog.value?.showModal()
  else if (!props.open) dialog.value?.close()
}
onMounted(sync)
watch(() => props.open, sync)
function cancel(event: Event) {
  event.preventDefault()
  if (!props.busy) emit('close')
}
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value && !props.busy) {
    const r = dialog.value!.getBoundingClientRect()
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      emit('close')
  }
}
</script>
<template>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="modal"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @cancel="cancel"
      @click="backdrop"
    >
      <h2 :id="titleId" class="text-3xl">{{ title }}</h2>
      <p v-if="description" :id="descriptionId" class="mt-3 text-sm text-muted">
        {{ description }}
      </p>
      <slot /></dialog
  ></Teleport>
</template>
