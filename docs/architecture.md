# Cobetes - F1 Bets Fullstack Architecture Document

## Change Log
| Date       | Version | Description                              | Author |
|------------|---------|------------------------------------------|--------|
| 2025-10-05 | v1.0    | Initial fullstack architecture snapshot. | AI Architect |

## Introduction
Cobetes - F1 Bets is a private Formula 1 prediction league for fewer than ten friends. The web application lets members submit weekly podium predictions, view standings, and if they are administrators publish official qualifying and race results. The system is currently in production and favors reliability and simplicity over large-scale growth. This document records the architecture exactly as it exists today so future agents can work effectively.

## Starter Template or Existing Project
- **Origin:** Custom-built Astro 5 project; not based on an external starter template.
- **Implications:** All patterns (auth helpers, REST endpoints, UI behaviors) were developed in-house. Agents should follow the conventions documented here because third-party starter documentation will not apply out of the box.

## High Level Architecture
### Technical Summary
Cobetes - F1 Bets runs as an Astro 5 server-rendered application deployed on Vercel's serverless runtime. Static Astro pages handle layout and SEO, while React 19 islands (mounted with `client:load`) power interactive views such as the betting form, ranking tables, and countdown timers. Backend capabilities are exposed through REST endpoints under `src/pages/api/**`; each endpoint executes within Vercel's function environment and uses the shared Turso (LibSQL) client located in `@/lib/turso`. Clients authenticate with JWTs signed by `JWT_SECRET` and stored in `sessionStorage`. Helpers in `@/utils/auth` validate tokens on every request. Frontend workflows dispatch `window.toast` and `toggleLoading` events to standardize notifications and loading indicators. All persistence uses handwritten SQL with soft deletes (`deleted_at`) to preserve history.

### Platform and Infrastructure Choice
- **Option A - Vercel + Turso (current setup)**
  - Pros: zero-maintenance Astro hosting, automatic serverless deployment of API routes, global edge caching, LibSQL latency optimized for European users.
  - Cons: tight vendor coupling, limited support for long-running background jobs.
- **Option B - Fly.io + Neon/Postgres**
  - Pros: greater control over container runtime, managed Postgres, easier cron/worker support.
  - Cons: additional operational overhead, slower iteration speed for this small team.
- **Option C - AWS Lambda + RDS**
  - Pros: enterprise-grade IAM, granular scaling controls, rich ecosystem integrations.
  - Cons: highest complexity, requires bespoke CI/CD and infrastructure management.

**Recommendation:** remain on **Option A (Vercel + Turso)**. The entire deployment pipeline, secret management, and runtime code already assume Vercel's `output: "server"` adapter. Current usage and budget do not justify migrating to heavier platforms.

- **Platform:** Vercel serverless runtime + Turso LibSQL
- **Key Services:** Vercel Functions, Vercel Edge CDN, Turso database instance
- **Deployment Host/Regions:** Vercel auto-distributed (primary region selected near deployment); Turso default region FRA with optional replicas

### Repository Structure
```
./
|- astro.config.mjs           # Astro configuration (output: 'server', Vercel adapter)
|- package.json               # Scripts and dependency manifest
|- public/                    # Logos, track flags, local fonts
|- src/
|  |- components/            # React islands (RankingOverview.jsx, NextBetDetails.jsx, etc.)
|  |- sections/              # Astro fragments (Administrator.astro, Profile.astro)
|  |- pages/
|  |  |- *.astro            # Public routes (landing, login, profile)
|  |  |- api/               # REST endpoints (auth, predictions, results, ranking)
|  |- utils/                 # Helpers (api.ts, auth.ts)
|  |- lib/                   # Turso client
|  |- function/              # Global toast registration
|  |- styles/                # Tailwind tokens and font-face declarations
|  |- layouts/               # Global layout wrapper
|- db/schema.sql              # LibSQL schema definition
|- docs/                      # Documentation (this file, brief.md)
`- .bmad-core/                # BMAD agent workflows
```

## System Blueprint
### Architectural Topology
- **Client:** Browser (desktop and mobile) running Astro-rendered pages with React islands; stores JWT in `sessionStorage`.
- **Edge/Server:** Vercel Functions executing Astro API handlers; each handler imports shared utilities and the Turso client.
- **Database:** Turso (LibSQL) accessed via `@libsql/client/web` with HTTPS endpoints.
- **Third-Party APIs:** Open-Meteo (weather + geocoding) fetched directly from the browser inside `NextBetDetails.jsx` to enrich race data.

### Core Request Flows
1. **User Login**
   1. User submits credentials to `/api/auth/login`.
   2. Endpoint verifies hash with `bcryptjs`, signs JWT with `JWT_SECRET`, returns token and user metadata.
   3. Browser stores token in `sessionStorage`; `window.toast` notifies success and `toggleLoading` hides overlay.
   4. Protected pages call `/api/auth/me` to hydrate profile and confirm token validity.

2. **Prediction Submission**
   1. `NextBetDetails.jsx` loads race metadata (`/api/race-weekends/next`), qualifying results (`/api/qualifying/[id]`), and current prediction (`/api/predictions/[id]`).
   2. Client-side validation ensures unique driver selection and cutoff timing (30 minutes before `race_date`).
   3. Submission POST/PUT hits `/api/predictions` or `/api/predictions/[id]` with JWT header.
   4. API validates ownership via `validateUser`, enforces soft-delete rules, and writes record to `Predictions` table.

3. **Admin Result Publication & Score Recalculation**
   1. Administrator UI (Administrator.astro + React helpers) loads via `/api/auth/is-admin` guard.
   2. Admin posts results to `/api/results` and qualifying data to `/api/qualifying`.
   3. After publishing, admin triggers `/api/predictions/calculate/[id]` to recompute season points using `calculatePredictionPoints`.
   4. Updated totals drive `/api/ranking` responses for every user.

## Backend Architecture
### API Surface Overview
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

### Patterns and Utilities
- **Response Helper:** `res` in `src/utils/api.ts` wraps `Response` creation with headers; ensures consistent JSON responses.
- **Authentication Helpers:** `checkAdmin` and `validateUser` in `src/utils/auth.ts` perform JWT verification and permission checks. Some legacy endpoints inline similar logic; consolidating them is a known improvement.
- **Error Handling:** endpoints return `{ error: string }` with HTTP statuses (400/401/403/404/500) and log errors via `console.error`.
- **Soft Deletes:** all delete operations set `deleted_at`; list queries filter `WHERE deleted_at IS NULL`.

### Deployment Considerations
- Astro configuration sets `output: "server"` with the Vercel adapter; `pnpm dev` mirrors serverless execution locally.
- Environment variables injected at build/deploy time: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
- No background workers; job-like operations (score recalculation) are triggered manually through HTTP endpoints.

## Data Architecture
### Database Schema (Turso / LibSQL)
- **drivers:** driver directory (id, name, nationality, timestamps, `deleted_at`).
- **race_weekends:** round metadata (round number, date, name, type `gp` or `sprint`).
- **results:** podium for each race weekend (positions 1-3) with FK to race.
- **qualifying:** full grid (top 20 positions) for each weekend.
- **users:** authentication source with `is_admin` flag and soft delete.
- **predictions:** user submissions per race with predicted podium and `total_points`.

Foreign keys are declared in `db/schema.sql`, but integrity relies on discipline because LibSQL relaxes enforcement. Every table includes `created_at` defaults and `deleted_at` for soft removal.

### Scoring Logic
Defined in `src/pages/api/predictions/calculate/[id].ts`:
- Grand Prix: exact position +3 points (all three correct = 10); podium presence +1.
- Sprint: exact match +1 (all three correct = 4).
- Computed totals written back to `Predictions.total_points` and consumed by `/api/ranking`.

## Frontend Architecture
### Routing and Layout
- Astro routes (`src/pages/*.astro`) define top-level pages: `/landing`, `/login`, `/apuestas`, `/perfil`, `/admin`, etc.
- `Layout.astro` wraps pages with header and footer components. Navigation state toggles admin links based on `/api/auth/is-admin` response.

### React Islands & State Patterns
- **RankingOverview.jsx:** fetches `/api/ranking` plus `/api/users/usernames`, merges them, and renders table with trend data.
- **NextBetDetails.jsx:** orchestrates race metadata, prediction state, weather lookup, and handles locking logic. Dispatches `toggleLoading` events around async calls and uses `window.toast` for feedback.
- **ResultsForm.astro** and **QualyForm.astro:** embed React forms for admins to publish official data; use shared toast/loading helpers.
- **LoadingOverlay.tsx:** listens for global `toggleLoading` events to show/hide overlay; ensures consistent UX across pages.

### Styling
- Tailwind CSS 4 via Vite plugin; tokens declared inside `src/styles/global.css` using `@theme` (primary, secondary, accent, footer colors and font families).
- F1-inspired font files in `public/fonts/` registered with `@font-face`.

## Authentication & Authorization
- Tokens stored in `sessionStorage`; absence triggers redirects in Astro scripts.
- Protected API routes require `Authorization: Bearer <token>` header.
- Admin endpoints reuse `checkAdmin`; failure returns 401/403 and UI hides admin sections.
- JWTs expire after 24 hours; no refresh flow, so clients reauthenticate when `/api/auth/me` fails.

## Observability and Operations
- **Logging:** `console.log`/`console.error` inside API handlers captured by Vercel; no central log aggregation.
- **Monitoring:** none configured; rely on Vercel analytics and manual smoke checks.
- **Metrics:** not instrumented; ranking accuracy verified manually after recalculation.

## Development Workflow
- Install dependencies: `pnpm install`.
- Local development: `pnpm dev` (Astro dev server on port 4321 by default).
- Production build: `pnpm build` followed by `pnpm preview` for local verification.
- Required environment variables: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (add to `.env`).
- Manual regression before deploy: login, submit and edit prediction, publish results, trigger recalculation, verify ranking page.

## Technical Debt & Risks
- **Duplicate auth logic:** some endpoints still inline JWT parsing instead of using `@/utils/auth`.
- **No automated tests:** increases regression risk; consider adding Playwright E2E and targeted unit tests (scoring, ranking queries).
- **JWT expiry UX:** users experience silent expiry; adding refresh tokens or proactive logout messaging would help.
- **SQL maintenance:** raw statements require diligence when schema changes; consider centralizing column names/constants.

## Coding Standards (Critical Rules)
- **Type sharing:** place reusable DTOs/helpers under `src/utils` or `src/lib` to avoid duplication.
- **API responses:** always return via `res(JSON.stringify(...), { status })` for consistent headers.
- **Database calls:** use `db.execute({ sql, args })` with parameter arrays; no string interpolation.
- **State synchronization:** fire `toggleLoading` and `window.toast` around async actions for consistent user feedback.
- **Soft deletes:** never hard delete rows; set `deleted_at` and filter accordingly.

## Naming Conventions
| Element             | Frontend pattern         | Backend pattern | Example                      |
|---------------------|--------------------------|-----------------|------------------------------|
| Components          | PascalCase               | -               | `RankingOverview.jsx`        |
| Hooks               | camelCase prefixed `use` | -               | `useRaceCountdown.ts`        |
| API routes          | -                        | kebab-case      | `/api/race-weekends/next`    |
| Database tables     | -                        | snake_case      | `race_weekends`              |
| Environment vars    | UPPER_SNAKE_CASE         | UPPER_SNAKE_CASE| `JWT_SECRET`                 |

## Testing Status
- **Automated tests:** none present.
- **Manual QA:** follow checklist in README (login, prediction CRUD, results publication, ranking refresh).
- **Recommendation:** introduce minimal integration test for scoring endpoint and a smoke E2E flow covering login -> prediction -> admin result.

## Future Considerations
- Add background job or webhook support if automated result ingestion is introduced.
- Implement refresh tokens or session renewal to avoid abrupt logouts mid-weekend.
- Consolidate authentication helpers to remove inline duplication.
- Explore lightweight monitoring (Vercel Analytics, Logflare) for production visibility.
