<script setup lang="ts">
import { watch } from 'vue'
import type { Server } from '@/entities'
import { useDeleteServer } from '@/features/monitoring/queries'
import Modal from '@/shared/ui/Modal.vue'
const props = defineProps<{ server: Server | null }>()
const emit = defineEmits<{ close: []; deleted: [] }>()
const remove = useDeleteServer()
watch(
  () => props.server,
  () => remove.reset(),
)
function confirmDelete() {
  if (!props.server || remove.isPending.value) return
  remove.mutate(props.server.id, {
    onSuccess: () => {
      emit('deleted')
      emit('close')
    },
  })
}
</script>
<template>
  <Modal
    :open="!!server"
    title="Delete monitor?"
    :description="`“${server?.name}” and its monitoring history will be removed. This cannot be undone.`"
    :busy="remove.isPending.value"
    @close="emit('close')"
  >
    <p v-if="remove.error.value" role="alert" class="field-error mt-4">
      {{ remove.error.value.message }}
    </p>
    <div class="mt-8 flex justify-end gap-3">
      <button
        class="btn btn-ghost"
        :disabled="remove.isPending.value"
        autofocus
        @click="emit('close')"
      >
        Cancel
      </button>
      <button class="btn" :disabled="remove.isPending.value" @click="confirmDelete">
        {{ remove.isPending.value ? 'Deleting…' : 'Delete monitor' }}
      </button>
    </div>
  </Modal>
</template>
