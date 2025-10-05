# High Level Architecture
## Technical Summary
Cobetes - F1 Bets runs as an Astro 5 server-rendered application deployed on Vercel's serverless runtime. Static Astro pages handle layout and SEO, while React 19 islands (mounted with `client:load`) power interactive views such as the betting form, ranking tables, and countdown timers. Backend capabilities are exposed through REST endpoints under `src/pages/api/**`; each endpoint executes within Vercel's function environment and uses the shared Turso (LibSQL) client located in `@/lib/turso`. Clients authenticate with JWTs signed by `JWT_SECRET` and stored in `sessionStorage`. Helpers in `@/utils/auth` validate tokens on every request. Frontend workflows dispatch `window.toast` and `toggleLoading` events to standardize notifications and loading indicators. All persistence uses handwritten SQL with soft deletes (`deleted_at`) to preserve history.

## Platform and Infrastructure Choice
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

## Repository Structure
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
