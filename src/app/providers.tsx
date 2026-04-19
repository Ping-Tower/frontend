import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { SignalRProvider } from '@/features/monitoring/SignalRProvider'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if ((error as { status?: number })?.status === 401) return false
        return failureCount < 2
      },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SignalRProvider>{children}</SignalRProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Alatsi, sans-serif',
            background: 'var(--color-surface-control)',
            border: '2px solid var(--color-stroke)',
            color: 'var(--color-stroke)',
            borderRadius: '12px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
