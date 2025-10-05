# Development Workflow
- Install dependencies: `pnpm install`.
- Local development: `pnpm dev` (Astro dev server on port 4321 by default).
- Production build: `pnpm build` followed by `pnpm preview` for local verification.
- Required environment variables: `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (add to `.env`).
- Manual regression before deploy: login, submit and edit prediction, publish results, trigger recalculation, verify ranking page.
