# AGENT ONBOARDING

Welcome to the F1 Bets Cobetes workspace. This guide gives AI agents and new contributors the minimum shared context required to extend the project without breaking existing conventions. Use the linked documents for deep dives.

> Language: All files inside `/context` are written in English so any tooling-oriented agent can consume them without translation.

## Project Snapshot
- **Product**: Betting-style companion app for Formula 1 weekends (session-managed, private community).
- **Stack**: Astro 5 (server output) + React islands, Tailwind CSS 4, LibSQL/Turso, JWT auth, Vercel deployment.
- **Entry Points**: Astro pages in `src/pages`, API routes under `src/pages/api`, shared libraries in `src/lib` and `src/utils`.
- **State Model**: Session token saved in `sessionStorage`; API enforces Bearer tokens and role checks; soft deletes via `deleted_at` columns.

## Read Next
- [`ARQUITECTURE.md`](./ARQUITECTURE.md): layout, data flow, hosting.
- [`RULES.md`](./RULES.md): coding patterns, naming, auth rules.
- [`TECHNICAL_CLUES.md`](./TECHNICAL_CLUES.md): operational tips, external services, testing gaps.

## Workflow Highlights
1. **Auth & Roles**: JWT tokens minted from `/api/auth/login`. Admin-only endpoints call `checkAdmin`, and UI hides admin controls for non-admins. See `RULES.md` for patterns.
2. **Data CRUD**: Turso SQL executed via `db.execute` with positional parameters. Soft deletes are the norm; updates use dynamic SQL builders.
3. **Predictions**: Race prediction lifecycle lives in `/api/predictions` routes. Scoring logic resides in `predictions/calculate/[id].ts` with sprint vs GP branching.
4. **Frontend Islands**: Astro sections handle lightweight forms; React islands fetch data (ranking, betting, countdown). Tailwind utilities + custom fonts drive styling.

## How to Extend Safely
- Confirm new features respect session/token flow and use shared libs (`@/lib/turso`, `@/utils/auth`, `@/utils/api`).
- When adding API routes, follow response helper + error pattern and update `RULES.md` if conventions evolve.
- Revisit `TECHNICAL_CLUES.md` for weather API usage, loading overlays, toast notifications, and other reusable pieces.

## Contact & Ownership
- Primary maintainer: Alejandro Sánchez Monzón (see repo README).
- Deployment: Vercel (`astro.config.mjs` adapter configured).

Keep documents synchronized when conventions change.
