<script setup lang="ts" generic="T extends string">
import { ref, watch } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from 'reka-ui'
// Reka hides surrounding content from screen readers; also prevent keyboard focus.
// Keep inert ownership separate from Reka's aria-hidden reference counts.
function inertBackground(target: HTMLElement) {
  const changed: HTMLElement[] = []
  let branch: HTMLElement | null = target
  while (branch && branch !== document.body) {
    for (const sibling of branch.parentElement?.children ?? []) {
      if (
        sibling !== branch &&
        sibling instanceof HTMLElement &&
        !sibling.inert &&
        !sibling.matches('script, style, [aria-live]')
      ) {
        sibling.inert = true
        changed.push(sibling)
      }
    }
    branch = branch.parentElement
  }
  return () => {
    for (const element of changed) element.inert = false
  }
}
const menu = ref<HTMLElement>(),
  open = ref(false)
watch(
  [menu, open],
  ([element, isOpen], _, cleanup) => {
    if (isOpen && element?.isConnected)
      cleanup(inertBackground(element.closest<HTMLElement>('[role="listbox"]') ?? element))
  },
  { flush: 'post' },
)
defineOptions({ inheritAttrs: false })
defineProps<{
  modelValue: T
  options: readonly { value: T; label: string; disabled?: boolean }[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
</script>
<template>
  <SelectRoot
    v-model:open="open"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event as T)"
  >
    <SelectTrigger v-bind="$attrs" class="select-trigger"
      ><SelectValue /><SelectIcon as-child
        ><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" /></svg></SelectIcon
    ></SelectTrigger>
    <SelectContent
      class="select-content"
      position="popper"
      :side-offset="6"
      :collision-padding="12"
      align="start"
      ><div ref="menu">
        <SelectViewport class="select-viewport"
          ><SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="select-item"
            ><SelectItemText>{{ option.label }}</SelectItemText
            ><SelectItemIndicator class="select-check"
              ><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="m3 8 3 3 7-7"
                  stroke="currentColor"
                  stroke-width="1.5"
                /></svg></SelectItemIndicator></SelectItem
        ></SelectViewport></div
    ></SelectContent>
  </SelectRoot>
</template>
