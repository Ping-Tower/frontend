import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useLogin } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout>
      <p className="auth-kicker">PingTower Console</p>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-description">
        Step into a quieter monitoring workspace with live server state, latency history, and incident routing.
      </p>

      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            type="email"
            placeholder="Email address"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="font-sans text-xs text-status-down px-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="font-sans text-xs text-status-down px-1">{errors.password.message}</p>
          )}
        </div>

        {login.error && (
          <p className="font-sans text-xs text-status-down px-1">
            {(login.error as Error).message}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" size="sm" disabled={login.isPending}>
            {login.isPending ? 'Logging in...' : 'Login'}
          </Button>

          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>

        <div className="mt-2 text-center">
          <Link
            to="/forgot-password"
            className="font-alatsi text-[0.75rem] text-muted transition-colors hover:text-stroke"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
