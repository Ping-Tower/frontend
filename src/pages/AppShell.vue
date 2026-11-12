<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/shared/stores/auth.store'
import { authApi } from '@/features/auth/api'
import { connectionStatus } from '@/features/monitoring/use-realtime'
import Brand from '@/shared/ui/Brand.vue'
const auth = useAuthStore(),
  router = useRouter(),
  qc = useQueryClient()
const logout = useMutation({
  mutationFn: () => authApi.logout(auth.refreshToken ?? ''),
  onSettled: () => {
    auth.clearSession()
    qc.clear()
    void router.replace('/login')
  },
})
const nav = [
  { to: '/app/servers', label: 'Monitors' },
  { to: '/app/settings/notifications', label: 'Notifications' },
  { to: '/app/settings/integrations', label: 'Integrations' },
]
</script>
<template>
  <div class="app-shell">
    <a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>
    <header class="app-header">
      <Brand to="/app/servers" />
      <nav class="app-nav" aria-label="Main navigation">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <span class="max-w-28 truncate text-xs text-muted">{{ auth.userName }}</span><button
          class="btn btn-outline btn-sm"
          :disabled="logout.isPending.value"
          @click="logout.mutate()"
        >
          Log out
        </button>
      </div>
    </header>
    <main id="main-content" class="min-w-0 flex-1"><RouterView :key="$route.path" /></main>
    <footer class="app-footer">
      <span>Four protocols. One clear picture.</span
      ><span role="status">{{
        connectionStatus === 'connected'
          ? '● Live status connected'
          : connectionStatus === 'connecting'
            ? '◌ Connecting to live status'
            : '○ Live status offline · refresh to check'
      }}</span>
    </footer>
  </div>
</template>
