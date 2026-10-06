import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-xs font-semibold font-alatsi tracking-[0.03em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-white/12 bg-surface-panel text-muted',
        up:      'border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-status-up',
        down:    'border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-status-down',
        unknown: 'border-[rgba(107,114,128,0.20)] bg-[rgba(107,114,128,0.08)] text-status-unknown',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const dot = variant === 'up' || variant === 'down' || variant === 'unknown'
  const dotChar = variant === 'up' ? '●' : variant === 'down' ? '●' : '○'
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="text-[0.5rem] leading-none">{dotChar}</span>}
      {children}
    </div>
  )
}

export { Badge }
