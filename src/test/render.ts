import type { Component } from 'vue'
import { render } from '@testing-library/vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { pinia } from '@/shared/stores/auth.store'
export async function renderApp(
  component: Component,
  props: Record<string, unknown> = {},
  route = '/app/servers',
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div/>' } }],
  })
  await router.push(route)
  await router.isReady()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return {
    router,
    client,
    ...render(component, {
      props,
      global: { plugins: [pinia, router, [VueQueryPlugin, { queryClient: client }]] },
    }),
  }
}
