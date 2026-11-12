<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Server, Protocol } from '@/entities'
import { PROTOCOLS } from '@/entities/status'
import { PROTOCOL_DEFAULTS, serverSchema, serverPayload } from '@/features/monitoring/server-form'
import { useServerMutation } from '@/features/monitoring/queries'
import Modal from '@/shared/ui/Modal.vue'
const props = defineProps<{ open: boolean; editing?: Server | null }>()
const emit = defineEmits<{ close: [] }>()
const mutation = useServerMutation()
const form = reactive({ name: '', host: '', port: 443, protocol: 'HTTPS' as Protocol, query: '' })
const errors = ref<Record<string, string>>({})
watch(
  () => [props.open, props.editing],
  () => {
    if (props.open) {
      Object.assign(
        form,
        props.editing
          ? {
              name: props.editing.name,
              host: props.editing.host,
              port: props.editing.port,
              protocol: props.editing.protocol,
              query: props.editing.query ?? '',
            }
          : { name: '', host: '', port: 443, protocol: 'HTTPS', query: '' },
      )
      errors.value = {}
      mutation.reset()
    }
  },
  { immediate: true },
)
function changeProtocol() {
  if (!props.editing || form.protocol === 'ICMP') form.port = PROTOCOL_DEFAULTS[form.protocol]
  if (form.protocol === 'ICMP') form.query = ''
}
function submit() {
  errors.value = {}
  const result = serverSchema.safeParse(form)
  if (!result.success) {
    for (const e of result.error.issues) errors.value[String(e.path[0])] = e.message
    return
  }
  mutation.mutate(
    { id: props.editing?.id, body: serverPayload(result.data) },
    { onSuccess: () => emit('close') },
  )
}
</script>
<template>
  <Modal
    :open="open"
    :title="editing ? 'Edit monitor' : 'Add monitor'"
    description="Choose a target and protocol. You can adjust check rules after adding it."
    :busy="mutation.isPending.value"
    @close="emit('close')"
  >
    <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="submit">
      <label class="field"
        ><span>Name</span
        ><input
          v-model="form.name"
          class="input"
          placeholder="Production API"
          :aria-invalid="!!errors.name"
          autofocus
        /><span v-if="errors.name" class="field-error">{{ errors.name }}</span></label
      >
      <label class="field"
        ><span>{{ form.protocol === 'ICMP' ? 'IP address' : 'Host' }}</span
        ><input
          v-model="form.host"
          class="input"
          :placeholder="form.protocol === 'ICMP' ? '10.0.0.1' : 'api.example.com'"
          :aria-invalid="!!errors.host"
        /><span v-if="errors.host" class="field-error">{{ errors.host }}</span></label
      >
      <div class="grid grid-cols-2 gap-5">
        <label v-if="form.protocol !== 'ICMP'" class="field"
          ><span>Port</span
          ><input
            v-model.number="form.port"
            class="input"
            type="number"
            min="1"
            max="65535"
            :aria-invalid="!!errors.port"
          /><span v-if="errors.port" class="field-error">{{ errors.port }}</span></label
        ><label class="field"
          ><span>Protocol</span
          ><select v-model="form.protocol" class="input" @change="changeProtocol">
            <option v-for="protocol in PROTOCOLS" :key="protocol">{{ protocol }}</option>
          </select></label
        >
      </div>
      <label v-if="form.protocol !== 'ICMP'" class="field"
        ><span>Query path (optional)</span
        ><input v-model="form.query" class="input" placeholder="/health"
      /></label>
      <p v-if="mutation.error.value" role="alert" class="field-error">
        {{ mutation.error.value.message }}
      </p>
      <div class="mt-3 flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="mutation.isPending.value"
          @click="emit('close')"
        >
          Cancel</button
        ><button class="btn" :disabled="mutation.isPending.value">
          {{ mutation.isPending.value ? 'Saving…' : editing ? 'Update' : 'Add' }}
        </button>
      </div>
    </form>
  </Modal>
</template>
