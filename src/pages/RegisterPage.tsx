import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Link } from 'react-router'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useRegister } from '@/features/auth/hooks'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field-error'
import { FormField } from '@/shared/ui/form-field'

const schema = z.object({
  name: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout>
      <h1 className="auth-title">Create your monitoring space</h1>

      <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} className="flex flex-col gap-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />
        </FormField>

        <FormField label="Username" error={errors.name?.message}>
          <Input placeholder="Team or user name" {...register('name')} aria-invalid={!!errors.name} />
        </FormField>

        <FormField label="Password" error={errors.password?.message} hint="At least 6 characters">
          <Input
            type="password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
        </FormField>

        <FieldError message={registerMutation.error?.message} />

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" size="sm" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating account...' : 'Register'}
          </Button>

          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/login">Already have an account</Link>
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
