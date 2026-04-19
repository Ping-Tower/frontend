# PingTower Frontend Agent Guide

## Scope

- This guide applies to `/home/semao0/Projects/PingTower/frontend`.
- `frontend` is currently not scaffolded. At the time of writing, the only verified asset is the logo at `/home/semao0/Projects/PingTower/frontend/wwwroot/pingtower logo.png`.
- Build the frontend as a separate SPA that talks to the existing `api` service.

## Product Goal

- Build the PingTower web frontend using the first Figma screen as the visual template for the product style.
- The product is a monitoring dashboard for managing servers, viewing status, inspecting ping history, and configuring notifications.
- The UI should feel like a focused ops dashboard rather than a generic CRUD admin.

## Visual Source Of Truth

- Primary design reference: `https://www.figma.com/design/FXgrjh4sJXuxfISBdX9IIX/PingTower?node-id=1-9&t=3J3DHlNplHCEMfbP-4`
- Brand asset: `/home/semao0/Projects/PingTower/frontend/wwwroot/pingtower logo.png`
- Verified traits from node `1:9`:
  - desktop-first wide auth layout
  - light gray main surface with thick black border and very large outer radius
  - `Alatsi` typography
  - left-aligned auth form block and right-aligned gear illustration
  - the gear illustration is a persistent auth-branding element, not a one-off decorative asset
  - pale gray inputs and buttons with black strokes
  - footer row with social icons on the left and language switcher on the right
- No Figma variables were defined on this screen, so frontend tokens must be created from the observed values and kept centralized.

## Mandatory Stack

- UI components: `shadcn/ui` + `Tailwind CSS`
- Server state: `@tanstack/react-query`
- Client state: `zustand`
- Real-time: `@microsoft/signalr`
- Charts: `recharts`
- Routing: `react-router` v7
- Language: `TypeScript`
- Recommended bootstrap for a greenfield SPA: `Vite + React`

## Why This Stack

- `shadcn/ui` gives headless building blocks that fit a dashboard system without forcing a theme.
- `TanStack Query` should own fetch lifecycle, caching, invalidation, and background refresh for API-backed data.
- `Zustand` should stay small and hold only cross-cutting client state like auth session and SignalR connection state.
- `@microsoft/signalr` matches the backend hub at `/hubs/monitoring`.
- `Recharts` is sufficient for ping latency history and uptime-related visuals.
- `React Router v7` is the default routing layer for a standalone SPA against an external API backend.

## Verified Backend Contract

- API base behavior:
  - authenticated API uses JWT
  - success payloads are wrapped as `{ code, message, data }`
- Auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/verify-email`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/resend-verification-code`
  - `POST /api/auth/logout`
- User endpoints:
  - `GET /api/users/me`
  - `PATCH /api/users/notification-settings`
- Server endpoints:
  - `GET /api/servers`
  - `GET /api/servers/{id}`
  - `POST /api/servers`
  - `PUT /api/servers/{id}`
  - `DELETE /api/servers/{id}`
  - `GET /api/servers/{id}/settings`
  - `PATCH /api/servers/{id}/settings`
  - `GET /api/servers/{id}/state`
  - `GET /api/servers/{id}/pings?from=&to=&limit=`
- Telegram endpoints:
  - `GET /api/telegram-accounts`
  - `POST /api/telegram-accounts`
  - `DELETE /api/telegram-accounts/{id}`
- SignalR hub:
  - path: `/hubs/monitoring`
  - methods: `SubscribeToServer(serverId)`, `UnsubscribeFromServer(serverId)`
  - event: `server-status-changed`
  - payload: `{ serverId: string, status: "UP" | "DOWN" | "UNKNOWN" }`

## Domain Facts The Frontend Must Respect

- Server protocol enum values: `HTTP`, `TCP`, `ICMP`, `HTTPS`
- Server status enum values: `UP`, `DOWN`, `UNKNOWN`
- Ping records include protocol-specific fields. The base chart-safe fields are:
  - `timestamp`
  - `isSuccess`
  - `latencyMs`
  - `errorMessage`
  - `statusCode`
- Login and refresh responses include:
  - `token`
  - `refreshToken`
  - `expiration`
  - `userId`
  - `userName`

## Frontend PRD

### Users

- Authenticated user who monitors a set of servers.
- User who needs fast visibility into server health and recent latency.
- User who configures notification settings and Telegram delivery.

### Primary Jobs To Be Done

- Sign in and restore a valid session without friction.
- See all monitored servers and immediately understand current health.
- Open a specific server and inspect recent ping history.
- Create, edit, and delete monitored targets.
- Tune ping settings and user notification settings.
- Manage linked Telegram accounts.

### MVP Screens

- Auth:
  - Login
  - Register
  - Verify email
  - Forgot password
  - Reset password
- App shell:
  - Dashboard overview
  - Servers list
  - Server details
  - Notification settings
  - Telegram accounts
- The first auth screen should mirror the verified composition from node `1:9`:
  - PingTower logo in the top-left
  - title `Welcome to PingTower!`
  - email and password fields
  - primary `Login` button
  - secondary CTA `I’m the first time`
  - right-side hero illustration with animated gears
  - footer social links and language selector

### Recommended Routes

- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/app`
- `/app/servers`
- `/app/servers/:serverId`
- `/app/settings/notifications`
- `/app/settings/integrations`

### Information Architecture

- Global app shell for authenticated routes:
  - branded sidebar with logo
  - top bar with current user and session actions
  - content area with consistent page header pattern
- Dashboard overview:
  - KPI cards for total servers and counts by status
  - recent incidents or attention-needed list
  - compact latency/status snapshot cards
- Servers list:
  - searchable/filterable table or card-table hybrid
  - columns: name, host, protocol, status, active, actions
  - quick actions: open, edit, delete
- Server details:
  - hero section with name, host, protocol, status
  - latency chart from `/api/servers/{id}/pings`
  - latest status widget from `/api/servers/{id}/state`
  - settings panel from `/api/servers/{id}/settings`
- Settings:
  - notification toggles from `/api/users/notification-settings`
  - Telegram account management from `/api/telegram-accounts`

## UX Requirements

- Use the first Figma screen as the baseline for layout rhythm, card shapes, spacing density, and color contrast.
- Preserve the intentionally blunt, heavy-outline visual language of the login template. Do not replace it with a generic modern SaaS gradient aesthetic.
- Reuse the logo in auth and app shell, but do not stretch or recolor it without a tokenized design reason.
- All authentication screens should reuse the gear motif as a branded hero element.
- Favor high signal density with clear visual hierarchy.
- Status must be recognizable at a glance through color plus label, not color alone.
- Forms must support loading, validation, success, and API error states.
- Empty states must explain the next action, especially for zero servers and zero Telegram accounts.
- Mobile support is required, but the desktop dashboard is the primary layout.
- Extend these observed login-screen traits into the rest of the product where appropriate:
  - gray base surfaces instead of white app chrome
  - thick black strokes
  - generous corner radius on large shells
  - simple, high-contrast controls
  - asymmetric layouts with clear weight separation between utility content and illustration/supporting content

## Motion Requirements

- Authentication pages must include the gear hero and it must animate continuously.
- Target behavior should be subtle and mechanical rather than playful:
  - slow continuous rotation
  - at least two gears rotating in opposite directions
  - no bounce, elastic easing, or exaggerated hover effects
- The motion reference is the rotating hero treatment requested from `https://claude.com/platform/api`.
- Treat the Claude page as directional inspiration for motion only. Keep PingTower's own visual language, proportions, colors, and outlines.
- Animation must not block interaction or compete with form readability.
- Respect reduced-motion preferences:
  - if `prefers-reduced-motion: reduce` is active, stop continuous rotation and fall back to a static hero
- The gear hero should be implemented as reusable auth artwork, not duplicated separately per page.

## Non-Goals For MVP

- Full marketing site
- Multi-tenant admin console
- Advanced incident timeline
- Fine-grained role management UI
- Realtime chart streaming beyond status updates

## Technical Architecture

### Project Structure

- `src/app`
  - app bootstrap, providers, router
- `src/shared`
  - config, API client, utils, UI primitives, constants
- `src/entities`
  - typed domain models and mapping helpers
- `src/features`
  - auth, server-crud, notification-settings, telegram-accounts, monitoring-realtime
- `src/widgets`
  - dashboard cards, server table, server detail panels, charts
- `src/pages`
  - route-level composition

### State Boundaries

- `TanStack Query`:
  - all API reads
  - all API mutations
  - invalidation after create/update/delete
  - background refetch for user/session-sensitive resources
- `Zustand`:
  - access token
  - refresh token
  - token expiration
  - hydrated session metadata
  - SignalR connection status
  - selected server subscriptions if needed
- Do not duplicate query data into Zustand.

### API Client Rules

- Centralize API access in a single typed client wrapper.
- Automatically unwrap `{ data }` from `ApiSuccessResult<T>`.
- Inject `Authorization: Bearer <token>`.
- On `401`, attempt one refresh flow via `POST /api/auth/refresh`, then retry the original request once.
- If refresh fails, clear session and redirect to `/login`.

### Realtime Rules

- Open SignalR connection only for authenticated users.
- Reconnect automatically with backoff.
- Subscribe to server groups only on screens that need server-specific realtime updates.
- On `server-status-changed`:
  - patch cached server list item status
  - patch server detail state cache
  - optionally invalidate related server queries if the cache shape diverges

### Query Key Baseline

- `['me']`
- `['servers']`
- `['server', serverId]`
- `['server-settings', serverId]`
- `['server-state', serverId]`
- `['server-pings', serverId, filters]`
- `['notification-settings']`
- `['telegram-accounts']`

## Design System Rules

- Create CSS variables for color, surface, border, radius, chart, and status tokens.
- Seed the initial token set from the verified auth screen:
  - surface base around `#adadad`
  - control fill around `#d9d9d9`
  - text and stroke `#000000`
  - placeholder text around `#8e8e8e`
- Map backend statuses to explicit semantic tokens:
  - `UP` -> success
  - `DOWN` -> destructive
  - `UNKNOWN` -> muted/warning-neutral
- Prefer shadcn primitives for:
  - `Button`
  - `Card`
  - `Dialog`
  - `Drawer`
  - `DropdownMenu`
  - `Form`
  - `Input`
  - `Select`
  - `Sheet`
  - `Table`
  - `Tabs`
  - `Tooltip`
- Keep chart styling aligned with the global token set. Do not leave Recharts on default colors.
- Define motion tokens for the auth hero so speed can be tuned centrally:
  - primary gear rotation duration
  - secondary gear rotation duration
  - easing

## Recommended Implementation Order

1. Scaffold app shell, routing, Tailwind, shadcn, and token system.
2. Implement auth flows and session persistence.
3. Implement authenticated layout and dashboard overview from the Figma template.
4. Implement servers list with fetch, filters, create/edit/delete dialogs.
5. Implement server detail page with status card, settings form, and latency chart.
6. Integrate SignalR status updates.
7. Implement notification settings and Telegram account management.
8. Add polish: skeletons, empty states, error boundaries, responsive behavior.

## Acceptance Criteria

- The first shipped UI visually follows the first Figma screen closely enough that the app reads as one product family.
- A user can log in, refresh the page, and remain authenticated until token refresh fails.
- A user can view all servers, open one server, inspect its status, and view recent pings.
- A user can create, edit, and delete a server.
- A user can update ping settings and notification settings.
- A user can add and remove Telegram accounts.
- A server status update received from SignalR changes visible UI without a full page reload.
- The app works on desktop and remains usable on mobile widths.

## Verification

- Prefer `pnpm` unless the repo establishes another package manager during scaffolding.
- Minimum checks once scaffolded:
  - `pnpm lint`
  - `pnpm build`
  - component-level or feature-level tests for critical flows when test tooling is added

## Agent Rules

- Start by checking whether `frontend` has been scaffolded since this document was written.
- Treat the Figma file as the visual source of truth and the `api` project as the functional source of truth.
- Do not invent endpoints that are not present in `api/src/Presentation/Controllers`.
- Keep auth, API client, query layer, and SignalR integration modular.
- Keep design tokens centralized so the UI can be tuned against Figma without touching feature code.
- Prefer feature-sliced React code over dumping everything into `pages`.
- Preserve the dashboard style consistently across auth and app screens.
