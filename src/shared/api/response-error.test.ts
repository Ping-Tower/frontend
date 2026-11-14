import { expect, it } from 'vitest'
import { responseError } from './response-error'
it('reads the actual ASP.NET duplicate-email response without exposing exception boilerplate', () => {
  const error = responseError(400, {
    title: 'Validation Exception',
    status: 400,
    detail:
      "Validation error at the Domain level.- DuplicateEmail: Email 'alex@example.com' is already taken.",
  })
  expect(error.code).toBe('duplicate-email')
  expect(error.message).toContain('confirmation email')
  expect(error.fieldErrors.email).toBe(error.message)
  expect(error.message).not.toContain('Exception')
  expect(error.message).not.toContain('alex@example.com')
})
it('reads ProblemDetails detail and structured field validation', () => {
  expect(responseError(400, { detail: 'Host is not allowed.' }).message).toBe(
    'Host is not allowed.',
  )
  const error = responseError(400, {
    title: 'One or more validation errors occurred.',
    errors: { Host: ['Enter a hostname.'], Port: ['Choose a port between 1 and 65535.'] },
  })
  expect(error.fieldErrors).toEqual({
    host: 'Enter a hostname.',
    port: 'Choose a port between 1 and 65535.',
  })
  expect(error.message).toContain('hostname')
})
it('returns actionable messages for unconfirmed email and invalid credentials', () => {
  expect(responseError(401, { detail: 'Email is not confirmed.' }).code).toBe('email-unconfirmed')
  expect(responseError(401, { detail: 'Invalid login attempt.' }).message).toContain(
    'email or password',
  )
  expect(responseError(401, { detail: 'User is locked out.' }).message).toContain('wait')
})
it('uses safe fallbacks for missing, malformed and internal server errors', () => {
  for (const status of [400, 401, 403, 404, 409, 413, 429, 500, 502, 503]) {
    const error = responseError(status, '<html>Bad gateway</html>')
    expect(error.message).not.toMatch(/HTTP \d|<html>|undefined/)
  }
  expect(responseError(500, { detail: 'Npgsql: password=secret' }).message).not.toContain('secret')
  expect(
    responseError(400, { detail: 'System.InvalidOperationException: internal' }).message,
  ).not.toContain('System.')
  expect(responseError(400, { message: { bad: true } }).message).toContain('check')
})
