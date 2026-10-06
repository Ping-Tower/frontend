import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useLogin } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field-error'
import { FormField } from '@/shared/ui/form-field'

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
      <h1 className="auth-title">Welcome back</h1>

      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="flex flex-col gap-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email" placeholder="you@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            type="password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
        </FormField>

        <FieldError message={login.error?.message} />

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
