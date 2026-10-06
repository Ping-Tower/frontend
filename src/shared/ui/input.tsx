import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-input border border-white/7 bg-surface-control px-3 text-sm font-alatsi text-stroke placeholder:text-muted/50 transition-colors focus-visible:outline-none focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/7 disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
