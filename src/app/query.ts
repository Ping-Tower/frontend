import { QueryClient } from '@tanstack/vue-query'
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, error) =>
        ![401, 403, 404].includes((error as { status?: number }).status ?? 0) && count < 2,
    },
  },
})
