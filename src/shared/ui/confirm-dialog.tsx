import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  isPending = false,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && !isPending && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-surface-shell border border-white/12 rounded-card p-6 shadow-xl">
          <Dialog.Title className="font-alatsi text-base font-bold text-stroke mb-2">{title}</Dialog.Title>
          <Dialog.Description className="font-sans text-sm text-muted mb-6 leading-relaxed">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="xs" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              size="xs"
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
