import { toast } from 'sonner'

/** Typed as `Error` so TanStack Query keeps inferring `Error` as the mutation error type. */
export function toastError(error: Error) {
  toast.error(error.message)
}
