import { cn } from '@/shared/lib/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-[4px] bg-surface-elevated', className)}
      {...props}
    />
  )
}

export { Skeleton }
