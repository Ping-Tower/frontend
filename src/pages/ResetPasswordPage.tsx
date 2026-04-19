import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useSearchParams } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { useResetPassword } from '@/features/auth/hooks'

const schema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const code = params.get('code') ?? ''

  const mutation = useResetPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthLayout>
      <p className="auth-kicker">Recovery</p>
      <h1 className="auth-title">Choose a new password</h1>
      <p className="auth-description">
        Enter your new password below.
      </p>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate({ email, code, newPassword: d.newPassword }))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <Input
            type="password"
            placeholder="New password"
            {...register('newPassword')}
            aria-invalid={!!errors.newPassword}
          />
          {errors.newPassword && (
            <p className="text-status-down text-sm font-alatsi px-1">{errors.newPassword.message}</p>
          )}
        </div>

        {mutation.error && (
          <p className="text-status-down text-sm font-alatsi px-1">
            {(mutation.error as Error).message}
          </p>
        )}

        {mutation.isSuccess && (
          <p className="text-status-up text-sm font-alatsi px-1">
            Password reset successfully. Redirecting to login...
          </p>
        )}

        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
