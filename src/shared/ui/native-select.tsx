import * as React from 'react'
import { cn } from '@/shared/lib/cn'

const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-9 rounded-[6px] border border-white/7 bg-surface-panel px-3 font-alatsi text-sm text-stroke focus:outline-none focus:border-brand/40',
        className
      )}
      {...props}
    />
  )
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
