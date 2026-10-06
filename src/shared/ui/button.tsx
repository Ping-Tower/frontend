import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-alatsi font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-surface-base hover:brightness-110',
        destructive:
          'bg-status-down-bg text-status-down border border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.18)]',
        outline:
          'bg-surface-panel border border-white/12 text-stroke hover:bg-surface-elevated',
        ghost:
          'bg-transparent text-muted hover:text-stroke',
        link:
          'text-stroke underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 text-sm rounded-button',
        sm:      'h-9 px-4 text-sm rounded-button',
        icon:    'size-9 rounded-button',
        xs:      'h-7 px-3 text-xs rounded-button',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
