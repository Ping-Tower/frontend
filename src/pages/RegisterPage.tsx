import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useRegister } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

const schema = z.object({
  name: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const register_ = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout>
      <p className="auth-kicker">New workspace</p>
      <h1 className="auth-title">Create your monitoring space</h1>
      <p className="auth-description">
        Set up your account and start tracking endpoints, latency, and notification flows
        from a single dashboard.
      </p>

      <form onSubmit={handleSubmit((d) => register_.mutate(d))} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input type="email" placeholder="Email address" {...register('email')} aria-invalid={!!errors.email} />
          {errors.email && (
            <p className="font-sans text-xs text-status-down px-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input placeholder="Team or user name" {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && (
            <p className="font-sans text-xs text-status-down px-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            type="password"
            placeholder="Create a password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="font-sans text-xs text-status-down px-1">{errors.password.message}</p>
          )}
        </div>

        {register_.error && (
          <p className="font-sans text-xs text-status-down px-1">
            {(register_.error as Error).message}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" size="sm" disabled={register_.isPending}>
            {register_.isPending ? 'Creating account...' : 'Register'}
          </Button>

          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/login">Already have an account</Link>
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
