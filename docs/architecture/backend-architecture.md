# Backend Architecture
## API Surface Overview
- `src/pages/api/auth/`
  - `login.ts` (POST): bcrypt check, JWT issuance.
  - `me.ts` (GET): returns username/email/is_admin based on token.
  - `is-admin.ts` (GET): boolean gate for admin UI visibility.
- `src/pages/api/predictions/`
  - `index.ts` (GET/POST): list or create predictions for authenticated user.
  - `[id].ts` (GET/PATCH/DELETE): fetch, update, or soft delete specific prediction.
  - `race/[race_weekend_id].ts` (GET): fetch predictions tied to a race for admin review.
  - `calculate/[id].ts` (PATCH): recalculate points after results posted (see scoring rules in file).
- `src/pages/api/results/` and `src/pages/api/qualifying/`: admin-managed podium and qualifying tables.
- `src/pages/api/race-weekends/`: CRUD for race metadata plus helper endpoints `next.ts`, `last.ts`, and `with-results/index.ts`.
- `src/pages/api/ranking/`: season and per-race leaderboards via SQL CTE aggregation.
- `src/pages/api/drivers/` and `src/pages/api/users/`: driver directory and administrative user management (soft deletes, role flags).

## Patterns and Utilities
- **Response Helper:** `res` in `src/utils/api.ts` wraps `Response` creation with headers; ensures consistent JSON responses.
- **Authentication Helpers:** `checkAdmin` and `validateUser` in `src/utils/auth.ts` perform JWT verification and permission checks. Some legacy endpoints inline similar logic; consolidating them is a known improvement.
- **Error Handling:** endpoints return `{ error: string }` with HTTP statuses (400/401/403/404/500) and log errors via `console.error`.
- **Soft Deletes:** all delete operations set `deleted_at`; list queries filter `WHERE deleted_at IS NULL`.

## Deployment Considerations
- Astro configuration sets `output: "server"` with the Vercel adapter; `pnpm dev` mirrors serverless execution locally.
- Environment variables injected at build/deploy time: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
- No background workers; job-like operations (score recalculation) are triggered manually through HTTP endpoints.
