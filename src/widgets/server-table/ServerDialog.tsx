import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import * as Dialog from '@radix-ui/react-dialog'
import { useCreateServer, useUpdateServer } from '@/features/monitoring/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { NativeSelect } from '@/shared/ui/native-select'
import { FormField } from '@/shared/ui/form-field'
import { cn } from '@/shared/lib/cn'
import { PROTOCOLS } from '@/entities/status'
import type { Protocol, Server } from '@/entities'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  host: z.string().min(1, 'Required'),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(PROTOCOLS),
  query: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const PROTOCOL_DEFAULTS: Record<Protocol, number> = {
  HTTP: 80,
  HTTPS: 443,
  TCP: 22,
  ICMP: 1,
}

interface ServerDialogProps {
  open: boolean
  onClose: () => void
  editing?: Server | null
}

export function ServerDialog({ open, onClose, editing }: ServerDialogProps) {
  const create = useCreateServer()
  const update = useUpdateServer(editing?.id ?? '')

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { port: 443, protocol: 'HTTPS' },
  })

  const protocol = useWatch({ control, name: 'protocol' })
  const isIcmp = protocol === 'ICMP'

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        host: editing.host,
        port: editing.port,
        protocol: editing.protocol,
        query: editing.query ?? '',
      })
    } else {
      reset({ port: 443, protocol: 'HTTPS' })
    }
  }, [editing, reset])

  function onProtocolChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Protocol
    setValue('protocol', next)
    if (!editing) setValue('port', PROTOCOL_DEFAULTS[next])
    if (next === 'ICMP') setValue('query', '')
  }

  function onSubmit(data: FormData) {
    const mutation = editing ? update : create
    const payload = isIcmp ? { ...data, query: undefined, port: PROTOCOL_DEFAULTS.ICMP } : data
    mutation.mutate(payload as Parameters<typeof create.mutate>[0], {
      onSuccess: () => {
        onClose()
        reset()
      },
    })
  }

  const isPending = create.isPending || update.isPending
  const mutationError = create.error ?? update.error

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface-shell border border-white/12 rounded-[8px] p-6 shadow-xl">
          <Dialog.Title className="font-alatsi text-base font-bold text-stroke mb-5">
            {editing ? 'Edit server' : 'Add server'}
          </Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <FormField label="Name" error={errors.name?.message}>
              <Input placeholder="Production API" {...register('name')} />
            </FormField>

            <FormField label={isIcmp ? 'IP Address' : 'Host'} error={errors.host?.message}>
              <Input
                placeholder={isIcmp ? '192.168.1.1' : 'api.example.com'}
                {...register('host')}
              />
            </FormField>

            <div className={cn('grid gap-3', isIcmp ? 'grid-cols-1' : 'grid-cols-2')}>
              {!isIcmp && (
                <FormField label="Port" error={errors.port?.message}>
                  <Input type="number" {...register('port', { valueAsNumber: true })} />
                </FormField>
              )}

              <FormField label="Protocol" error={errors.protocol?.message}>
                <NativeSelect {...register('protocol')} onChange={onProtocolChange} className="w-full bg-surface-control">
                  {PROTOCOLS.map((p) => <option key={p} value={p}>{p}</option>)}
                </NativeSelect>
              </FormField>
            </div>

            {!isIcmp && (
              <FormField label="Query path (optional)" error={errors.query?.message}>
                <Input placeholder="/health" {...register('query')} />
              </FormField>
            )}

            {mutationError && (
              <p className="font-sans text-sm text-status-down">{mutationError.message}</p>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <Button type="button" variant="ghost" size="xs" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="xs" disabled={isPending}>
                {isPending ? 'Saving...' : editing ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
