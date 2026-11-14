import { ref, onMounted, onBeforeUnmount, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
export function useUnsavedChanges(dirty: MaybeRefOrGetter<boolean>) {
  const open = ref(false)
  let pending: Promise<boolean> | undefined, resolve: ((leave: boolean) => void) | undefined
  function confirmLeave(): boolean | Promise<boolean> {
    if (!toValue(dirty)) return true
    if (pending) return pending
    open.value = true
    pending = new Promise<boolean>((done) => {
      resolve = done
    })
    return pending
  }
  function answer(leave: boolean) {
    open.value = false
    resolve?.(leave)
    resolve = undefined
    pending = undefined
  }
  function beforeUnload(event: BeforeUnloadEvent) {
    if (toValue(dirty)) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  onBeforeRouteLeave(() => confirmLeave())
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnload)
    answer(false)
  })
  return { open, confirmLeave, stay: () => answer(false), discard: () => answer(true) }
}
