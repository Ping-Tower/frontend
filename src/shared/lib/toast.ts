import { ref } from 'vue'
export const notifications = ref<{ id: number; message: string }[]>([])
let nextId = 0
export function notify(message: string) {
  const id = ++nextId
  notifications.value.push({ id, message })
  window.setTimeout(() => dismiss(id), 5000)
}
export function dismiss(id: number) {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}
