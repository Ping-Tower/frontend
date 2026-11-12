import { createApp, watch } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { pinia, authStore } from '@/shared/stores/auth.store'
import { queryClient } from '@/app/query'
import { router } from '@/app/router'
import App from './App.vue'
import './index.css'
const app = createApp(App)
app.use(pinia).use(VueQueryPlugin, { queryClient }).use(router)
watch(
  () => authStore().token,
  (token, previous) => {
    if (!token && previous) {
      queryClient.clear()
      if (router.currentRoute.value.meta.requiresAuth) void router.replace('/login')
    }
  },
)
app.mount('#root')
