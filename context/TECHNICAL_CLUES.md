# Technical Clues

## Setup & Environment
- **Env vars**: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`; all required for API routes.
- **Scripts**: `pnpm`/`npm run dev` starts Astro; `build` prepares production output.

## Shared Utilities
- `@/lib/turso`: single database client. If you need alternative access (batch scripts/tests) create a helper and document it.
- `@/utils/auth`: exports `checkAdmin` and `validateUser`. Avoid re-implementing JWT parsing in routes.
- `@/function/toast` + `Toast.astro`: registers `window.toast`. Use it for user feedback.
- `LoadingOverlay.tsx`: listens for the global `toggleLoading` event. Dispatch `new CustomEvent('toggleLoading', { detail: boolean })` before/after async operations.

## Frontend Patterns
- `sessionStorage` is the only client-side auth source. Refresh tokens after login, clear them on logout.
- Astro components (`*.astro`) embed inline scripts for simple DOM handling; React (`*.jsx`/`*.tsx`) leverages hooks and native `fetch`.
- Tailwind 4 uses the `@theme` block in `global.css` for tokens; stay consistent with existing names.

## Domain Logic
- **Prediction cutoff**: 30 minutes before `race_date` (computed in `NextBetDetails` and `NextRaceCountdown`).
- **Scoring**: Grand Prix → exact pick 3 pts, podium presence 1 pt, full podium 10 pts. Sprint → exact pick 1 pt, full podium 4 pts (`predictions/calculate/[id].ts`).
- **Ranking**: `/api/ranking` CTE builds season totals and latest race points; sorted descending server-side.
- **Soft delete**: `deleted_at` governs visibility. Endpoints query `... WHERE deleted_at IS NULL`.

## External Services
- **Open-Meteo**: geocoding + current weather (no API key). Guard against rate-limit errors with fallbacks.
- **Fonts & Icons**: Local FontAwesome; race flags and track images live in `public/`. Follow the naming scheme (`round_number`.png / `<Nationality>.png`).

## Known Considerations
- Many endpoints still duplicate validation logic—consider consolidating helpers.
- No refresh tokens or client-side expiry handling. JWT expires in 1 day → redirect to login when `/api/auth/me` fails.
- Dynamic SQL updates rely on column allowlists; double-check for typos and missing constraints.
- No automated tests. Manually verify end-to-end flows after API or scoring changes.

## Adding Features
- Ensure new routes follow the existing JSON + status response format.
- Keep UI/UX aligned with token state (menu visibility, redirects) and remember to fire `toggleLoading` + `toast` events.
- Document meaningful additions here so future agents don’t have to rediscover patterns.
