import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/** Label above a control, with an optional hint and validation error below it. */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className={cn(
          'font-alatsi text-[0.68rem] font-semibold uppercase tracking-[0.08em]',
          error ? 'text-status-down' : 'text-muted'
        )}
      >
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-sans text-xs text-status-down">{error}</span>
      ) : (
        hint && <span className="font-sans text-xs text-muted/70">{hint}</span>
      )}
    </label>
  )
}
