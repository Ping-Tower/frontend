import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useForgotPassword } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

const schema = z.object({ email: z.email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const mutation = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthLayout>
      <p className="auth-kicker">Recovery</p>
      <h1 className="auth-title">Reset password</h1>
      <p className="auth-description">
        Enter your email to receive a reset link.
      </p>

      {mutation.isSuccess ? (
        <div className="rounded-[6px] border border-white/12 bg-surface-panel p-4 font-sans text-sm text-stroke">
          Check your inbox for the reset link.
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d.email))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input type="email" placeholder="Email address" {...register('email')} aria-invalid={!!errors.email} />
            {errors.email && (
              <p className="text-status-down text-sm font-alatsi px-1">{errors.email.message}</p>
            )}
          </div>

          {mutation.error && (
            <p className="text-status-down text-sm font-alatsi px-1">
              {(mutation.error as Error).message}
            </p>
          )}

          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm font-semibold text-muted transition-colors hover:text-stroke">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
