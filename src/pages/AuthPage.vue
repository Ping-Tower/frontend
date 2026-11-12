<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/features/auth/components/AuthLayout.vue'
import { useAuthForm } from '@/features/auth/use-auth-form'
const props = defineProps<{ mode: string }>()
const route = useRoute()
const { form, errors, success, verificationEmail, mutation, verify, resend } = useAuthForm(
  () => props.mode,
)
const titles: Record<string, string> = {
  login: 'Welcome back',
  register: 'Make room for peace of mind.',
  'forgot-password': 'Forgot your password?',
  'reset-password': 'Choose a new password',
  'verify-email': 'Check your inbox',
}
const title = computed(() =>
  props.mode === 'verify-email' && route.query.code ? 'Confirming your email…' : titles[props.mode],
)
const resetComplete = computed(() => !!route.query.email && !!route.query.code)
watch(
  () => [props.mode, route.query.email, route.query.code],
  () => {
    errors.value = {}
    success.value = ''
    mutation.reset()
    if (props.mode === 'verify-email' && route.query.email && route.query.code) verify.mutate()
  },
  { immediate: true },
)
</script>
<template>
  <AuthLayout>
    <h1 class="auth-title">{{ title }}</h1>
    <template v-if="mode === 'verify-email'">
      <p v-if="verificationEmail" class="auth-description">
        {{ route.query.code ? 'Verifying' : 'We sent a confirmation link to' }}
        <strong>{{ verificationEmail }}</strong>.
      </p>
      <p v-else class="auth-description">
        No registration in progress.
        <RouterLink to="/register" class="underline">Register first</RouterLink>.
      </p>
      <p v-if="verify.error.value" role="alert" class="field-error mb-5">
        {{ verify.error.value.message }}
      </p>
      <p v-if="resend.error.value" role="alert" class="field-error mb-5">
        {{ resend.error.value.message }}
      </p>
      <p v-if="success" role="status" class="mb-5">{{ success }}</p>
      <button
        v-if="verificationEmail"
        class="btn btn-outline w-full"
        :disabled="resend.isPending.value || verify.isPending.value"
        @click="resend.mutate()"
      >
        {{ resend.isPending.value ? 'Sending…' : 'Resend verification link' }}
      </button>
      <RouterLink to="/login" class="btn btn-ghost mt-3 w-full">Back to login</RouterLink>
    </template>
    <template v-else-if="mode === 'reset-password' && !resetComplete"
      ><p class="auth-description">
        This reset link is incomplete. Request a new link to continue.
      </p>
      <RouterLink class="btn" to="/forgot-password">Request a reset link</RouterLink></template
    >
    <form v-else class="flex flex-col gap-6" novalidate @submit.prevent="mutation.mutate()">
      <label v-if="mode !== 'reset-password'" class="field"
        ><span>Email</span
        ><input
          v-model="form.email"
          class="input"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="!!errors.email"
        /><span v-if="errors.email" class="field-error">{{ errors.email }}</span></label
      >
      <label v-if="mode === 'register'" class="field"
        ><span>Username</span
        ><input
          v-model="form.name"
          class="input"
          autocomplete="username"
          placeholder="Your name"
          :aria-invalid="!!errors.name"
        /><span v-if="errors.name" class="field-error">{{ errors.name }}</span></label
      >
      <label v-if="mode === 'login' || mode === 'register'" class="field"
        ><span>Password</span
        ><input
          v-model="form.password"
          class="input"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          :aria-invalid="!!errors.password"
        /><span v-if="errors.password" class="field-error">{{ errors.password }}</span
        ><span v-else-if="mode === 'register'" class="text-muted"
          >At least 6 characters.</span
        ></label
      >
      <label v-if="mode === 'reset-password'" class="field"
        ><span>New password</span
        ><input
          v-model="form.newPassword"
          class="input"
          type="password"
          autocomplete="new-password"
          :aria-invalid="!!errors.newPassword"
        /><span v-if="errors.newPassword" class="field-error">{{ errors.newPassword }}</span></label
      >
      <p v-if="mutation.error.value" role="alert" class="field-error">
        {{ mutation.error.value.message }}
      </p>
      <p v-if="success" role="status">{{ success }}</p>
      <button class="btn mt-2 w-full" type="submit" :disabled="mutation.isPending.value">
        {{
          mutation.isPending.value
            ? 'Please wait…'
            : mode === 'login'
              ? 'Login'
              : mode === 'register'
                ? 'Register'
                : mode === 'forgot-password'
                  ? 'Send reset link'
                  : 'Reset password'
        }}
      </button>
      <RouterLink v-if="mode === 'login'" to="/register" class="btn btn-outline w-full"
        >Create account</RouterLink
      >
      <RouterLink v-if="mode === 'register'" to="/login" class="btn btn-outline w-full"
        >Already have an account</RouterLink
      >
      <RouterLink
        :to="mode === 'login' ? '/forgot-password' : '/login'"
        class="text-center text-sm text-muted underline underline-offset-4"
        >{{ mode === 'login' ? 'Forgot password?' : 'Back to login' }}</RouterLink
      >
    </form>
  </AuthLayout>
</template>
