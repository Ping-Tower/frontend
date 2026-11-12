# PingTower frontend

This guide applies to this directory. The user authorized the November 2026 redesign
and migration to Vue; this supersedes the previous React/Figma scaffold instructions.

## Stack and boundaries

- Vue 3 single-file components, Composition API, TypeScript, Vite and Tailwind CSS.
- Vue Router for routes, Pinia for session state, TanStack Vue Query for API data.
- SignalR for `server-status-changed` and ECharts for metrics.
- Keep backend data out of Pinia. Keep API adapters, validation, query keys and page
  composition separate. Do not add React dependencies.
- Verify endpoints against `../api/src/Presentation/Controllers`.
- SignalR sends to the authenticated user; the current hub has no subscribe methods.

## Design

Use the supplied `PingTower Design System (1).html` as the reference. Centralize tokens
in `src/index.css`: monochrome palette, thin rules, pills, Bricolage Grotesque titles,
Instrument Sans UI and DM Mono measurements. Keep the bundled mark/fonts and licenses.
States use both shape and label. Do not invent degraded status from UNKNOWN.
Support keyboard operation, native dialog focus behavior, reduced motion and mobile.

## Verification

Use the pinned pnpm version via Corepack with Node 24. Run:

- `pnpm lint`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm test:e2e` (install Chromium with Playwright if needed)

Browser tests must intercept only URL paths starting with `/api/`, never module paths
containing `/shared/api/`. Keep external API calls mocked in automated UI tests.
