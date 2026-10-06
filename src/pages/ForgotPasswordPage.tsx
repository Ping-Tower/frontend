import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useForgotPassword } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field-error'
import { FormField } from '@/shared/ui/form-field'

const schema = z.object({ email: z.email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const mutation = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthLayout>
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
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />
          </FormField>

          <FieldError message={mutation.error?.message} />

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
