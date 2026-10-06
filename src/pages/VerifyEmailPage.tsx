import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { PENDING_VERIFY_EMAIL_KEY } from '@/features/auth/hooks'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/shared/stores/auth.store'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field-error'
import { toastError } from '@/shared/lib/toast'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)

  const emailFromUrl = searchParams.get('email') ?? ''
  const codeFromUrl = searchParams.get('code') ?? ''
  const emailFromStorage = sessionStorage.getItem(PENDING_VERIFY_EMAIL_KEY) ?? ''
  const email = emailFromUrl || emailFromStorage
  const autoVerifyTriggered = useRef(false)

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authApi.verifyEmail(email, code),
    onSuccess: (data) => {
      sessionStorage.removeItem(PENDING_VERIFY_EMAIL_KEY)
      setSession(data)
      navigate('/app/servers', { replace: true })
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(email),
    onSuccess: () => toast.success(`Verification link sent to ${email}`),
    onError: toastError,
  })

  const verify = verifyMutation.mutate
  useEffect(() => {
    if (!autoVerifyTriggered.current && emailFromUrl && codeFromUrl) {
      autoVerifyTriggered.current = true
      verify(codeFromUrl)
    }
  }, [codeFromUrl, emailFromUrl, verify])

  if (!email) {
    return (
      <AuthLayout>
        <h1 className="auth-title">Verify email</h1>
        <p className="auth-description">
          No registration in progress.{' '}
          <button onClick={() => navigate('/register')} className="font-semibold underline text-stroke">
            Register first
          </button>
        </p>
      </AuthLayout>
    )
  }

  if (emailFromUrl && codeFromUrl) {
    return (
      <AuthLayout>
        <h1 className="auth-title">Confirming your email…</h1>
        <p className="auth-description">Verifying <strong>{email}</strong>.</p>
        {verifyMutation.error && (
          <div className="flex flex-col gap-4">
            <FieldError message={verifyMutation.error.message} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? 'Sending...' : 'Resend verification link'}
            </Button>
          </div>
        )}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Check your inbox</h1>
      <p className="auth-description">
        We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
      </p>

      <div className="flex flex-col gap-3 mt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending ? 'Sending...' : 'Resend verification link'}
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </div>
    </AuthLayout>
  )
}
