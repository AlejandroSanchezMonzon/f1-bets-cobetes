# System Blueprint
## Architectural Topology
- **Client:** Browser (desktop and mobile) running Astro-rendered pages with React islands; stores JWT in `sessionStorage`.
- **Edge/Server:** Vercel Functions executing Astro API handlers; each handler imports shared utilities and the Turso client.
- **Database:** Turso (LibSQL) accessed via `@libsql/client/web` with HTTPS endpoints.
- **Third-Party APIs:** Open-Meteo (weather + geocoding) fetched directly from the browser inside `NextBetDetails.jsx` to enrich race data.

## Core Request Flows
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
