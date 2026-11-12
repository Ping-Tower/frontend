import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
const session = {
  token: 'e2e-access',
  refreshToken: 'e2e-refresh',
  expiration: '2030-01-01',
  userId: 'u1',
  userName: 'Alex',
}
const initialServers = [
  {
    id: 's1',
    name: 'Production API',
    host: 'api.example.com',
    port: 443,
    protocol: 'HTTPS',
    status: 'UP',
    isActive: true,
    query: '/health',
    createdAt: '2026-11-01',
    updatedAt: '2026-11-12',
  },
  {
    id: 's2',
    name: 'Mail',
    host: 'mail.example.com',
    port: 25,
    protocol: 'TCP',
    status: 'DOWN',
    isActive: true,
    query: null,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-12',
  },
]
async function mockApi(page: Page, authenticated = true) {
  if (authenticated)
    await page.addInitScript(
      (s) => localStorage.setItem('pingtower-auth', JSON.stringify({ state: s, version: 0 })),
      session,
    )
  let servers = [...initialServers]
  let settings = { onDown: true, onUp: true, onLatency: true, cooldownSec: 600 }
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const req = route.request()
      const url = new URL(req.url())
      const path = url.pathname
      const respond = (data: unknown, status = 200) =>
        route.fulfill({ status, json: { code: status, message: 'OK', data } })
      if (path === '/api/auth/login') return respond(session)
      if (path === '/api/auth/logout') return respond(null)
      if (path === '/api/users/me')
        return respond({ id: 'u1', userName: 'Alex', email: 'alex@example.com', roles: [] })
      if (path === '/api/users/notification-settings') {
        if (req.method() === 'PATCH') settings = { ...settings, ...req.postDataJSON() }
        return respond(settings)
      }
      if (path === '/api/telegram-accounts') return respond([])
      if (path === '/api/servers') {
        if (req.method() === 'POST') {
          servers.push({ ...initialServers[0], ...req.postDataJSON(), id: 's3' })
          return respond(servers.at(-1), 201)
        }
        return respond(servers)
      }
      if (path === '/api/servers/s1/overview')
        return respond({
          target: servers[0],
          summary: {
            totalChecks: 100,
            successfulChecks: 100,
            uptimePct: 100,
            avgLatencyMs: 42,
            p50LatencyMs: 38,
            p90LatencyMs: 52,
            p99LatencyMs: 61,
          },
          chart: {
            from: '2026-11-12T10:00:00Z',
            to: '2026-11-12T12:00:00Z',
            bucketSizeSec: 60,
            buckets: [],
            statusCodes: [],
          },
        })
      if (path.endsWith('/uptime')) return respond({ uptimePct: 100, p90LatencyMs: 52 })
      if (path.endsWith('/state')) return respond({ status: 'UP' })
      if (path.endsWith('/settings'))
        return respond({
          pingSettings: {
            intervalSec: 60,
            retries: 2,
            failureThreshold: 3,
            latencyThresholdMs: 500,
          },
          notificationSettings: null,
        })
      if (path.endsWith('/pings')) return respond([])
      if (req.method() === 'DELETE') {
        servers = servers.filter((s) => !path.endsWith(s.id))
        return route.fulfill({ status: 204 })
      }
      if (req.method() === 'PUT') {
        servers = servers.map((s) => (path.endsWith(s.id) ? { ...s, ...req.postDataJSON() } : s))
        return respond(servers.find((s) => path.endsWith(s.id)))
      }
      return route.fulfill({ status: 404, json: { message: `Unmocked: ${path}` } })
    },
  )
}
async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
}
test('public pages and auth flows fit the viewport', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Know what’s up. Get on with life.' }),
  ).toBeVisible()
  await expectNoOverflow(page)
  await page.getByRole('link', { name: 'Log in', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expectNoOverflow(page)
  await page.getByRole('link', { name: 'Create account' }).click()
  await expect(page.getByLabel('Username')).toBeVisible()
  await expectNoOverflow(page)
  for (const path of ['/forgot-password', '/reset-password', '/verify-email']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoOverflow(page)
  }
})
test('protects private routes', async ({ page }) => {
  await page.goto('/app/servers')
  await expect(page).toHaveURL(/\/login$/)
})
test('logs in, restores a session and logs out', async ({ page }) => {
  await mockApi(page, false)
  await page.goto('/login')
  await page.getByLabel('Email').fill('alex@example.com')
  await page.getByLabel('Password').fill('secret123')
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your monitors.' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Production API ↗' })).toBeVisible()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})
test('creates, edits, filters and deletes a monitor', async ({ page }) => {
  await mockApi(page)
  await page.goto('/app/servers')
  await expect(page.getByRole('link', { name: 'Mail ↗' })).toBeVisible()
  await expectNoOverflow(page)
  await page.getByRole('button', { name: '+ Add monitor', exact: true }).click()
  await page.getByLabel('Name', { exact: true }).fill('New website')
  await page.getByLabel('Host', { exact: true }).fill('new.example.com')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByRole('link', { name: 'New website ↗' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit New website', exact: true }).click()
  await page.getByLabel('Name', { exact: true }).fill('Renamed website')
  await page.getByRole('button', { name: 'Update', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Renamed website ↗' })).toBeVisible()
  await page.getByLabel('Filter by status').selectOption('DOWN')
  await expect(page.getByRole('link', { name: 'Mail ↗' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Production API ↗' })).toHaveCount(0)
  await page.getByLabel('Filter by status').selectOption('all')
  await page.getByLabel('Search monitors').fill('Renamed')
  await page.getByRole('button', { name: 'Delete Renamed website', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete monitor', exact: true })
    .click()
  await expect(page.getByText(/No monitors match/)).toBeVisible()
})
test('monitor detail supports tabs and empty chart data', async ({ page }) => {
  await mockApi(page)
  await page.goto('/app/servers/s1')
  await expect(page.getByRole('heading', { name: 'Production API' })).toBeVisible()
  await expect(page.getByText('No ping data yet for the selected window.')).toBeVisible()
  await expectNoOverflow(page)
  await page.getByRole('tab', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ping Settings' })).toBeVisible()
  await expectNoOverflow(page)
})
test('navigation, notification preferences and integrations work', async ({ page }) => {
  await mockApi(page)
  await page.goto('/app/servers')
  await page.getByRole('link', { name: 'Notifications', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Notifications', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Server down/ }).click()
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.getByRole('button', { name: 'Save preferences' })).toBeDisabled()
  await expectNoOverflow(page)
  await page.getByRole('link', { name: 'Integrations', exact: true }).click()
  await expect(page.getByText(/No Telegram accounts linked/)).toBeVisible()
  await expectNoOverflow(page)
})
test('monitors page offers retry on a failed API', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/servers', (route) =>
    route.fulfill({ status: 503, json: { message: 'Unavailable' } }),
  )
  await page.goto('/app/servers')
  await expect(page.getByRole('heading', { name: 'Could not load monitors.' })).toBeVisible({
    timeout: 15000,
  })
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
})

test('major screens meet automated accessibility checks', async ({ page }, testInfo) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  await mockApi(page)
  for (const path of ['/', '/app/servers', '/app/settings/notifications']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    if (path === '/app/servers')
      await expect(page.getByRole('link', { name: 'Mail ↗' })).toBeVisible()
    if (path.endsWith('notifications'))
      await expect(page.getByRole('button', { name: 'Save preferences' })).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
    await page.screenshot({
      path: testInfo.outputPath(
        path === '/'
          ? 'landing.png'
          : path.endsWith('notifications')
            ? 'notifications.png'
            : 'dashboard.png',
      ),
      fullPage: true,
    })
  }
})

test('live SignalR updates change the displayed monitor status', async ({ page }) => {
  await mockApi(page)
  await page.routeWebSocket('**/hubs/monitoring**', (ws) => {
    ws.onMessage((message) => {
      if (String(message).includes('protocol')) {
        ws.send('{}\u001e')
        setTimeout(
          () =>
            ws.send(
              JSON.stringify({
                type: 1,
                target: 'server-status-changed',
                arguments: [{ serverId: 's1', status: 'DOWN' }],
              }) + '\u001e',
            ),
          800,
        )
      }
    })
  })
  await page.goto('/app/servers')
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('link', { name: 'Production API ↗' }) })
  await expect(row).toHaveAttribute('data-status', 'DOWN')
  await expect(page.getByText('● Live status connected')).toBeVisible()
})

test('renders measured charts, protocol metrics and check details', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/servers/s1/overview?*', (route) =>
    route.fulfill({
      json: {
        data: {
          target: initialServers[0],
          summary: {
            totalChecks: 10,
            successfulChecks: 9,
            uptimePct: 90,
            avgLatencyMs: 42,
            p50LatencyMs: 38,
            p90LatencyMs: 52,
            p99LatencyMs: 61,
            avgDnsLookupMs: 4,
            tlsVersions: [{ version: 'TLS1.3' }],
          },
          chart: {
            from: '2026-11-12T10:00:00Z',
            to: '2026-11-12T12:00:00Z',
            bucketSizeSec: 60,
            buckets: Array.from({ length: 10 }, (_, i) => ({
              bucket: new Date(Date.UTC(2026, 10, 12, 10, i)).toISOString(),
              totalChecks: 1,
              successChecks: i === 5 ? 0 : 1,
              avgLatencyMs: i === 5 ? null : 40 + i,
              p50LatencyMs: i === 5 ? null : 38 + i,
              p90LatencyMs: i === 5 ? null : 50 + i,
              p99LatencyMs: i === 5 ? null : 60 + i,
              avgDnsLookupMs: 4,
            })),
            statusCodes: [
              { code: '200', count: 9 },
              { code: '503', count: 1 },
            ],
          },
        },
      },
    }),
  )
  await page.route('**/api/servers/s1/pings?*', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: 'p1',
            serverId: 's1',
            timestamp: '2026-11-12T10:05:00Z',
            protocol: 'HTTPS',
            isSuccess: false,
            latencyMs: null,
            statusCode: 503,
            errorMessage: 'Service unavailable',
            tlsVersion: 'TLS1.3',
            dnsLookupMs: 4,
          },
        ],
      },
    }),
  )
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/app/servers/s1')
  await expect(page.locator('.metric-chart canvas')).toBeVisible()
  await expectNoOverflow(page)
  await page.getByRole('tab', { name: 'Protocol metrics' }).click()
  await expect(page.getByRole('heading', { name: 'DNS lookup', exact: true })).toBeVisible()
  await expect(page.getByText('9 responses')).toBeVisible()
  await page.getByRole('tab', { name: 'Logs', exact: true }).click()
  await page.getByRole('button', { name: 'Inspect' }).click()
  await expect(page.getByText('Service unavailable')).toBeVisible()
  expect(errors).toEqual([])
})
