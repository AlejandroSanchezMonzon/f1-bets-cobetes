<img style="display: block; margin: auto; object-fit: cover; width: 50%;" src="https://github.com/user-attachments/assets/9e222c62-03ad-44b0-8ac0-a34f7d46340c" alt="Official logo of the F1 Bets Cobetes web app" />

# F1 Bets Cobetes

F1 Bets Cobetes is a private web application that helps a small group of Formula 1 fans run friendly prediction contests. Members log in every race week, submit podium picks, and watch the automatic leaderboard update once official results are posted.

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Available Commands](#available-commands)
- [Architecture & Documentation](#architecture--documentation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview
The platform combines Astro pages with React islands to deliver a fast, responsive experience on both desktop and mobile. Serverless API routes host the business logic and persist data to a LibSQL/Turso database.

## Key Features
- **JWT authentication:** email/password login with profile refresh endpoints.
- **Prediction workflow:** dynamic forms, validation, and automatic submission lock 30 minutes before each session.
- **Admin console:** manage race and qualifying results, recalculate scores, and clean up submissions.
- **Leaderboard:** React-powered ranking view with season totals and latest race highlights.
- **Responsive UI:** Tailwind CSS 4 tokens and custom F1-inspired typography.

## Technology Stack
- [Astro 5](https://astro.build/) (`output: "server"`) deployed to Vercel.
- [React 19](https://react.dev/) islands for interactive sections.
- [Tailwind CSS 4](https://tailwindcss.com/) with theme tokens defined in `src/styles/global.css`.
- [LibSQL / Turso](https://turso.tech/) for relational storage.
- [JSON Web Tokens](https://jwt.io/) for authentication and authorization.

## Getting Started

### Requirements
- Node.js 18 or newer.
- Package manager you prefer (`pnpm`, `npm`, or `yarn`). The repository ships with `pnpm-lock.yaml`.

### Installation
```bash
git clone https://github.com/AlejandroSanchezMonzon/f1-bets-cobetes.git
cd f1-bets-cobetes
pnpm install    # or npm install / yarn install
```

### Environment Variables
Create a `.env` file at the project root with:

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens. |
| `TURSO_DATABASE_URL` | Connection string for the LibSQL/Turso instance. |
| `TURSO_AUTH_TOKEN` | Auth token for the database. |

> **Never** commit environment variables to source control.

### Available Commands
| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server at `http://localhost:4321`. |
| `pnpm build` | Produce the production build. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm astro ...` | Run arbitrary Astro CLI commands. |

## Architecture & Documentation
- High-level documentation lives in `docs/index.md`, which links to every project guide.
- The canonical architecture reference is `docs/architecture.md`, sharded into sections under `docs/architecture/` for quick access (authentication, backend, frontend, etc.).
- The project brief is stored at `docs/brief.md`.

## Usage
The live deployment is available at [f1-bets-cobetes.vercel.app](https://f1-bets-cobetes.vercel.app). After signing in you can:
- Submit or edit predictions before the cutoff.
- Review the global ranking and historical results.
- (Admins only) Publish qualifying and race results, then trigger score recalculation.

## Contributing
Contributions are welcome! Follow these steps:
1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-change
   ```
2. Implement updates while following the coding standards documented in `docs/architecture/coding-standards-critical-rules.md`.
3. Run the relevant checks and update documentation when needed.
4. Commit and push your branch:
   ```bash
   git commit -m "feat: describe your change"
   git push origin feature/your-change
   ```
5. Open a Pull Request describing the problem solved, tests performed, and any screenshots.

## License
This project is distributed under the [MIT](LICENSE) license.

## Contact
- **Alejandro Sánchez Monzón** – [GitHub](https://github.com/AlejandroSanchezMonzon)

---

© 2025 F1 Bets Cobetes
