import { z } from 'zod'
export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Username must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})
export const emailSchema = z.object({ email: z.email('Enter a valid email') })
export const PENDING_VERIFY_EMAIL_KEY = 'pendingVerifyEmail'
