import { reactive, ref, computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/shared/stores/auth.store'
import { authApi } from './api'
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetSchema,
  PENDING_VERIFY_EMAIL_KEY,
} from './schemas'
import { ApiError } from '@/shared/api/client'
import { notify } from '@/shared/lib/toast'
export function useAuthForm(mode: () => string) {
  const route = useRoute(),
    router = useRouter()
  const form = reactive({ email: '', password: '', name: '', newPassword: '' })
  const errors = ref<Record<string, string>>({})
  const success = ref('')
  const verificationEmail = computed(() =>
    String(
      route.query.email || form.email || sessionStorage.getItem(PENDING_VERIFY_EMAIL_KEY) || '',
    ),
  )
  const mutation = useMutation({
    onError: (error) => {
      if (error instanceof ApiError) errors.value = { ...error.fieldErrors }
    },
    mutationFn: async () => {
      const action = mode()
      errors.value = {}
      success.value = ''
      const schema =
        action === 'register'
          ? registerSchema
          : action === 'login'
            ? loginSchema
            : action === 'reset-password'
              ? resetSchema
              : emailSchema
      const result = schema.safeParse(form)
      if (!result.success) {
        for (const issue of result.error.issues) errors.value[String(issue.path[0])] = issue.message
        return
      }
      if (action === 'login') {
        const session = await authApi.login(form.email, form.password)
        authStore().setSession(session)
        await router.push('/app/servers')
      }
      if (action === 'register') {
        await authApi.register(form.email, form.password, form.name)
        sessionStorage.setItem(PENDING_VERIFY_EMAIL_KEY, form.email)
        await router.push('/verify-email')
      }
      if (action === 'forgot-password') {
        await authApi.forgotPassword(form.email)
        success.value = 'Check your inbox. If an account exists, a reset link is on its way.'
      }
      if (action === 'reset-password') {
        const email = String(route.query.email ?? ''),
          code = String(route.query.code ?? '')
        if (!email || !code) throw new Error('This reset link is incomplete. Request a new one.')
        await authApi.resetPassword(email, code, form.newPassword)
        notify('Password updated. You can log in now.')
        await router.push('/login')
      }
    },
  })
  const verify = useMutation({
    mutationFn: () => authApi.verifyEmail(verificationEmail.value, String(route.query.code ?? '')),
    onSuccess: async (session) => {
      sessionStorage.removeItem(PENDING_VERIFY_EMAIL_KEY)
      authStore().setSession(session)
      await router.replace('/app/servers')
    },
  })
  const resend = useMutation({
    mutationFn: () => {
      const email = verificationEmail.value.trim()
      const parsed = emailSchema.safeParse({ email })
      if (!parsed.success)
        throw new Error('Enter a valid email address to request a confirmation link.')
      return authApi.resendVerification(email)
    },
    onSuccess: () => {
      success.value = 'A new verification link is on its way.'
    },
  })
  function requestVerification() {
    const email = form.email.trim()
    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) {
      errors.value = { email: 'Enter a valid email' }
      return
    }
    sessionStorage.setItem(PENDING_VERIFY_EMAIL_KEY, email)
    resend.mutate(undefined, {
      onSuccess: () => {
        void router.push('/verify-email')
      },
    })
  }
  return { form, errors, success, verificationEmail, mutation, verify, resend, requestVerification }
}
