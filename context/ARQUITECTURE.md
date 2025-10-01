# Architecture

## Main Layers
- **UI / Presentation**: Astro 5 renders static/SSR pages. React 19 islands (`client:load`) power interactive views (ranking, bets, countdown). Tailwind 4 and the custom F1 typefaces (`src/styles/global.css`) handle styling.
- **Application Logic**: Astro scripts (vanilla DOM) manage lightweight forms, menu toggles, and session redirects. React components cover views with multiple fetch calls and shared state.
- **Internal API**: Endpoints under `src/pages/api/**` run in the Astro runtime when deployed on Vercel. They expose REST-style routes for CRUD operations on users, predictions, race weekends, results, and qualifying data.
- **Persistence**: Turso (LibSQL) consumed via `@libsql/client/web`. All queries use `db.execute({ sql, args })` and the `deleted_at` column for soft deletes.

## Data Flow
1. **Authentication**
   - `/api/auth/login` validates credentials with bcrypt and returns a JWT signed with `import.meta.env.JWT_SECRET`.
   - The client stores the token in `sessionStorage` and sends it as `Authorization: Bearer <token>`.
   - `/api/auth/me` returns basic profile data; `/api/auth/is-admin` keeps admin controls restricted.
2. **Predictions & Results**
   - Users create/edit predictions via `/api/predictions` and `/api/predictions/[race_weekend_id]`.
   - Admins publish race results (`/api/results`, `/api/results/[race_weekend_id]`) and qualifying tables (`/api/qualifying/*`).
   - `/api/predictions/calculate/[id]` recomputes scores once official results are in.
3. **Ranking**
   - `/api/ranking` uses SQL CTEs to aggregate season totals and latest-race points.
   - The React `RankingOverview` component enriches entries by pulling usernames from `/api/users/{id}`.
4. **Dynamic Content**
   - `NextBetDetails` combines race metadata, qualy results, the user’s prediction, live weather (Open-Meteo), and podium outcomes to enable or block submissions.

## Static Assets
- Assets live in `public/`: brand logos, weather icons, flags (per race round and pilot nationality), bundled FontAwesome files.
- F1 fonts in `public/fonts/` are registered via `@font-face`.

## Configuration & Environment
- `astro.config.mjs` sets `output: 'server'`, integrates Tailwind (Vite plugin) and React, and configures deployment on Vercel.
- Import alias `@/*` is declared in `tsconfig.json` (`baseUrl: '.'`).
- Required env vars: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.

## Deployment
- NPM scripts (`dev`, `build`, `preview`) rely on the Astro CLI.
- `output: 'server'` + the Vercel adapter produce serverless endpoints.

## Notes
- There is no ORM; SQL strings are written by hand. Keep table names consistent: `Users`, `Predictions`, `Race_Weekends`, `Results`, `Qualifying`.
- Loading components (`LoadingOverlay`) synchronize global states via `toggleLoading` events.
