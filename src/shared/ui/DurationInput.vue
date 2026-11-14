<script setup lang="ts">
import { ref, watch, useId } from 'vue'
import Select from './Select.vue'
const props = defineProps<{ modelValue: string; invalid?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const multipliers = { seconds: 1, minutes: 60, hours: 3600 } as const
type Unit = keyof typeof multipliers
const options = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
] as const
function bestUnit(seconds: number): Unit {
  return seconds > 0 && seconds % 3600 === 0
    ? 'hours'
    : seconds > 0 && seconds % 60 === 0
      ? 'minutes'
      : 'seconds'
}
const unit = ref<Unit>(bestUnit(Number(props.modelValue)))
const amount = ref('')
function seconds() {
  if (!amount.value.trim()) return ''
  const value = Number(amount.value) * multipliers[unit.value]
  const rounded = Math.round(value)
  return String(Math.abs(value - rounded) < 1e-7 ? rounded : value)
}
function sync() {
  amount.value = props.modelValue.trim()
    ? String(Number(props.modelValue) / multipliers[unit.value])
    : ''
}
sync()
watch(
  () => props.modelValue,
  () => {
    if (seconds() !== props.modelValue) sync()
  },
)
function changeUnit(value: Unit) {
  unit.value = value
  sync()
}
function input(event: Event) {
  amount.value = (event.target as HTMLInputElement).value
  emit('update:modelValue', seconds())
}
</script>
<template>
  <div class="field mt-4">
    <label :for="id" class="field-label">Cooldown</label>
    <div class="flex items-center gap-3">
      <input
        :id="id"
        :value="amount"
        class="input flex-1"
        type="number"
        min="0"
        :step="unit === 'seconds' ? 1 : 'any'"
        :aria-invalid="invalid"
        :aria-describedby="`${id}-hint`"
        @input="input"
      />
      <Select
        :model-value="unit"
        :options="options"
        class="!w-auto min-w-32"
        aria-label="Cooldown unit"
        @update:model-value="changeUnit"
      />
    </div>
    <span :id="`${id}-hint`" class="text-muted"
      >Repeated events of the same type wait until this cooldown ends.</span
    >
  </div>
</template>
