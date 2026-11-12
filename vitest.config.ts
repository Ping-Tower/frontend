import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/shared/api/client.ts',
        'src/shared/stores/auth.store.ts',
        'src/entities/status.ts',
        'src/features/monitoring/realtime-cache.ts',
        'src/features/monitoring/server-form.ts',
        'src/widgets/server-detail/monitoring-window.ts',
        'src/widgets/server-detail/use-monitoring-window.ts',
        'src/features/auth/schemas.ts',
        'src/features/auth/use-auth-form.ts',
        'src/widgets/server-table/ServerDialog.vue',
        'src/widgets/server-table/ServerTable.vue',
        'src/widgets/server-detail/CheckRules.vue',
        'src/pages/AuthPage.vue',
        'src/pages/NotificationSettingsPage.vue',
      ],
      thresholds: { lines: 85, functions: 85, branches: 80, statements: 85 },
    },
  },
})
