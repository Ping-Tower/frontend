export interface ResponseError {
  message: string
  code?: 'duplicate-email' | 'duplicate-username' | 'email-unconfirmed'
  fieldErrors: Record<string, string>
}
const fallbackMessages: Record<number, string> = {
  400: 'Please check the information you entered and try again.',
  401: 'Please sign in again to continue.',
  403: 'You don’t have permission to do that.',
  404: 'This item could not be found. Refresh the page and try again.',
  409: 'This item has changed or already exists. Refresh the page and try again.',
  413: 'The information sent is too large. Reduce its size and try again.',
  429: 'Too many attempts. Please wait a little before trying again.',
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}
function clean(message: string): string {
  return message
    .replace(/^Validation error at the Domain level\.?\s*-?\s*/i, '')
    .replace(/^(?:Domain|Validation) (?:Exception|error)[:.\s-]*/i, '')
    .replace(
      /\b(?:PasswordTooShort|PasswordRequiresDigit|PasswordRequiresUpper|PasswordRequiresLower|PasswordRequiresNonAlphanumeric|InvalidEmail|InvalidUserName):\s*/g,
      '',
    )
    .trim()
}
/** Accept both the legacy envelope and ASP.NET ProblemDetails / ValidationProblemDetails. */
export function responseError(status: number, payload: unknown, path = ''): ResponseError {
  const body = record(payload)
  const fieldErrors: Record<string, string> = {}
  for (const [field, value] of Object.entries(record(body.errors))) {
    const messages = (Array.isArray(value) ? value : [value]).map(text).filter(Boolean)
    if (messages.length)
      fieldErrors[field.replace(/^\$\./, '').replace(/^./, (c) => c.toLowerCase())] =
        messages.join(' ')
  }
  const supplied = text(body.detail) || text(body.message) || Object.values(fieldErrors).join(' ')
  // Never expose server exceptions, stack traces, proxy HTML or database diagnostics.
  if (status >= 500)
    return {
      message: 'The service is temporarily unavailable. Please try again shortly.',
      fieldErrors: {},
    }
  if (/DuplicateEmail|email .*already (?:taken|registered)/i.test(supplied)) {
    const message =
      'An account with this email already exists. Log in, or request a confirmation email if you haven’t confirmed it yet.'
    return { message, code: 'duplicate-email', fieldErrors: { email: message } }
  }
  if (/DuplicateUserName|username .*already taken/i.test(supplied)) {
    const message = 'This username is already taken. Please choose another.'
    return { message, code: 'duplicate-username', fieldErrors: { name: message } }
  }
  if (/email is not confirmed/i.test(supplied)) {
    return {
      message:
        'Confirm your email before logging in. You can request a new confirmation email below.',
      code: 'email-unconfirmed',
      fieldErrors: {},
    }
  }
  if (/invalid login attempt/i.test(supplied)) {
    return {
      message: 'The email or password is incorrect. Please check them and try again.',
      fieldErrors: {},
    }
  }
  if (/user is locked out/i.test(supplied)) {
    return {
      message: 'Too many unsuccessful login attempts. Please wait a little before trying again.',
      fieldErrors: {},
    }
  }
  const cleaned = clean(supplied)
  const technical =
    /<[^>]+>|\b(?:System\.|StackTrace|SqlException|Npgsql|Microsoft\.|Exception:)|\bat .+\([^)]*\)\s*(?:in |$)/i.test(
      cleaned,
    )
  const fallback =
    status === 401 && path === '/api/auth/login'
      ? 'The email or password is incorrect. Please check them and try again.'
      : (fallbackMessages[status] ?? 'We couldn’t complete your request. Please try again.')
  return { message: cleaned && !technical ? cleaned : fallback, fieldErrors }
}
