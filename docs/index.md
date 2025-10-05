# Documentation Index

## Root Documents

### [Cobetes - F1 Bets Fullstack Architecture Document](./architecture.md)

Cobetes - F1 Bets is a private Formula 1 prediction league for fewer than ten friends. The web application lets members submit weekly podium predictions, view standings, and if they are administrators publish official qualifying and race results. The system is currently in production and favors reliability and simplicity over large-scale growth. This document records the architecture exactly as it exists today so future agents can work effectively.

### [Project Brief: Cobetes - F1 Bets](./brief.md)

Cobetes - F1 Bets is a lightweight private web application where a tight-knit group of Formula 1 fans submit weekly race predictions and automatically track scores across the season. The platform replaces cobbled-together Discord threads and Google Forms with a purpose-built experience that runs smoothly without a dedicated organizer. Tailored strictly to the group's needs, it offers exactly the prediction inputs and scoring they want-no noisy extras-delivering fast setup, consistent deadlines, and immediate results.

## Architecture

Documents within the architecture/ directory:

### [Authentication & Authorization](./architecture/authentication-authorization.md)

- Tokens stored in `sessionStorage`; absence triggers redirects in Astro scripts.

### [Backend Architecture](./architecture/backend-architecture.md)

- `src/pages/api/auth/`

### [Change Log](./architecture/change-log.md)

No description available.

### [Cobetes - F1 Bets Fullstack Architecture Document](./architecture/index.md)

- [Cobetes - F1 Bets Fullstack Architecture Document](#table-of-contents)

### [Coding Standards (Critical Rules)](./architecture/coding-standards-critical-rules.md)

- **Type sharing:** place reusable DTOs/helpers under `src/utils` or `src/lib` to avoid duplication.

### [Data Architecture](./architecture/data-architecture.md)

- **drivers:** driver directory (id, name, nationality, timestamps, `deleted_at`).

### [Development Workflow](./architecture/development-workflow.md)

- Install dependencies: `pnpm install`.

### [Frontend Architecture](./architecture/frontend-architecture.md)

- Astro routes (`src/pages/*.astro`) define top-level pages: `/landing`, `/login`, `/apuestas`, `/perfil`, `/admin`, etc.

### [Future Considerations](./architecture/future-considerations.md)

- Add background job or webhook support if automated result ingestion is introduced.

### [High Level Architecture](./architecture/high-level-architecture.md)

Cobetes - F1 Bets runs as an Astro 5 server-rendered application deployed on Vercel's serverless runtime. Static Astro pages handle layout and SEO, while React 19 islands (mounted with `client:load`) power interactive views such as the betting form, ranking tables, and countdown timers. Backend capabilities are exposed through REST endpoints under `src/pages/api/**`; each endpoint executes within Vercel's function environment and uses the shared Turso (LibSQL) client located in `@/lib/turso`. Clients authenticate with JWTs signed by `JWT_SECRET` and stored in `sessionStorage`. Helpers in `@/utils/auth` validate tokens on every request. Frontend workflows dispatch `window.toast` and `toggleLoading` events to standardize notifications and loading indicators. All persistence uses handwritten SQL with soft deletes (`deleted_at`) to preserve history.

### [Introduction](./architecture/introduction.md)

Cobetes - F1 Bets is a private Formula 1 prediction league for fewer than ten friends. The web application lets members submit weekly podium predictions, view standings, and if they are administrators publish official qualifying and race results. The system is currently in production and favors reliability and simplicity over large-scale growth. This document records the architecture exactly as it exists today so future agents can work effectively.

### [Naming Conventions](./architecture/naming-conventions.md)

No description available.

### [Observability and Operations](./architecture/observability-and-operations.md)

- **Logging:** `console.log`/`console.error` inside API handlers captured by Vercel; no central log aggregation.

### [Starter Template or Existing Project](./architecture/starter-template-or-existing-project.md)

- **Origin:** Custom-built Astro 5 project; not based on an external starter template.

### [System Blueprint](./architecture/system-blueprint.md)

- **Client:** Browser (desktop and mobile) running Astro-rendered pages with React islands; stores JWT in `sessionStorage`.

### [Technical Debt & Risks](./architecture/technical-debt-risks.md)

- **Duplicate auth logic:** some endpoints still inline JWT parsing instead of using `@/utils/auth`.

### [Testing Status](./architecture/testing-status.md)

- **Automated tests:** none present.

