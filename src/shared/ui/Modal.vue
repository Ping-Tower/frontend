<script setup lang="ts">
import { ref, watch, onMounted, useId } from 'vue'
const props = defineProps<{ open: boolean; title: string; description?: string; busy?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const titleId = useId(),
  descriptionId = useId()
let startedOnBackdrop = false
function sync() {
  startedOnBackdrop = false
  if (props.open && !dialog.value?.open) dialog.value?.showModal()
  else if (!props.open) dialog.value?.close()
}
onMounted(sync)
watch(() => props.open, sync)
function cancel(event: Event) {
  event.preventDefault()
  if (!props.busy) emit('close')
}
function isBackdrop(event: MouseEvent) {
  const element = dialog.value
  if (!element || event.target !== element) return false
  const r = element.getBoundingClientRect()
  return (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  )
}
function pointerDown(event: PointerEvent) {
  startedOnBackdrop = event.button === 0 && !props.busy && isBackdrop(event)
}
function backdrop(event: MouseEvent) {
  // A selection can start inside the form and end on the backdrop. Preserve that draft.
  const dismiss = startedOnBackdrop && isBackdrop(event)
  startedOnBackdrop = false
  if (dismiss && !props.busy) emit('close')
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
      @pointerdown.capture="pointerDown"
      @pointercancel="startedOnBackdrop = false"
      @click="backdrop"
    >
      <h2 :id="titleId" class="text-3xl">{{ title }}</h2>
      <p v-if="description" :id="descriptionId" class="mt-3 text-sm text-muted">
        {{ description }}
      </p>
      <slot /></dialog
  ></Teleport>
</template>
