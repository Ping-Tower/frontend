import { ref } from 'vue'
export type Theme = 'light' | 'dark'
const theme = ref<Theme>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
const storageKey = 'pingtower-theme'
function apply(value: Theme) {
  document.documentElement.dataset.theme = value
  theme.value = value
}
export function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  apply(next)
  try {
    localStorage.setItem(storageKey, next)
  } catch {
    /* Theme still works when storage is unavailable. */
  }
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  try {
    if (localStorage.getItem(storageKey)) return
  } catch {
    /* Use the system preference. */
  }
  apply(event.matches ? 'dark' : 'light')
})
window.addEventListener('storage', (event) => {
  if (event.key !== storageKey) return
  apply(
    event.newValue === 'dark' ||
      (!event.newValue && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light',
  )
})
export function useTheme() {
  return theme
}
