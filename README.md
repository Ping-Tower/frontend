# PingTower Frontend

Vue 3 + TypeScript SPA for the existing PingTower API. Vue Router handles navigation,
Pinia holds the session, TanStack Vue Query owns server data, and SignalR updates live
statuses. Charts use ECharts and load only on the monitor detail screen.

## Run

Use Node 24 and the pinned pnpm version (Corepack reads `packageManager`).

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

`VITE_API_URL` points to the API during local development. Leave it empty in production:
nginx proxies `/api` and `/hubs` to the backend. `VITE_TELEGRAM_BOT_USERNAME` enables the
Telegram Login Widget. Without it, the interface explains that connection is unavailable.

Production image: `docker compose up -d --build`. Whole stack: `make -C ../infra up`.

## Verify

```bash
pnpm lint
pnpm test:coverage
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

`pnpm check` runs all checks. Browser tests mock only API requests, use an isolated
session, and exercise both desktop Chromium and a mobile viewport with touch enabled.
They never modify real monitors. API and Telegram service integration still require a
running backend and a configured Telegram bot.

Vitest covers transport, shared refresh, session persistence, validation, realtime cache,
time ranges, auth forms, and monitor creation/filtering/deletion. Coverage thresholds
apply to the core modules and critical forms listed in `vitest.config.ts`, not the entire
application. The HTML report is at `coverage/index.html`.

The GitLab `frontend_checks` job runs lint, coverage, production build and browser tests
before the existing image build and deployment stages.

## Design

The visual source is **PingTower Design System (1).html**, supplied for this redesign.
It supersedes the former Figma/gear treatment: black and white, 1px rules, pill controls,
Bricolage Grotesque headings, Instrument Sans interface text, and DM Mono measurements.
The original mark and bundled fonts are stored locally in `public/`; their font licenses
are preserved in `public/fonts/LICENSE.txt`. Tokens and responsive rules live in
`src/index.css`. Status uses shape and label; `UNKNOWN` is never presented as degraded.

## Architecture

- `src/app`: router and query client.
- `src/shared`: typed API transport, Pinia session, formatting, reusable UI.
- `src/entities`: backend domain contracts.
- `src/features`: auth, monitoring queries/mutations, live updates, account integration.
- `src/widgets`: monitor table/dialog, chart, protocol metrics, checks and check rules.
- `src/pages`: route composition.
- `e2e`: browser acceptance tests.

The API client unwraps `{ code, message, data }`, shares one token refresh among
concurrent requests, retries once, and clears rejected sessions. The root watcher clears
private query caches on logout and redirects protected routes. Existing stored sessions
from the React version are accepted during migration.

| Route                                 | Screen                                         |
| ------------------------------------- | ---------------------------------------------- |
| `/`                                   | Product page                                   |
| `/login`, `/register`                 | Sign in and registration                       |
| `/verify-email`, `/auth/verify-email` | Email confirmation                             |
| `/forgot-password`, `/reset-password` | Password recovery                              |
| `/app/servers`                        | Monitors, status totals and filters            |
| `/app/servers/:serverId`              | Metrics, protocol details, checks and settings |
| `/app/settings/notifications`         | Alert rules and destinations                   |
| `/app/settings/integrations`          | Telegram accounts                              |

The backend currently exposes `UP`, `DOWN` and `UNKNOWN`, not degraded status,
public status-page publishing or an on-demand probe endpoint. Those design examples
are not exposed as nonfunctional controls.
