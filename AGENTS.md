# Codex Collaboration Guide

This file is read by Codex (and any other coding agents) before helping in this repository. No persona framework is used—Codex should respond conversationally and follow the instructions below.

---

## 1. Instructions To Codex
1. Treat every user request as plain English guidance; no agent activation steps are required.
2. If the task is non-trivial (more than a quick edit), outline a brief plan before executing when it adds clarity.
3. Quote file paths exactly (`docs/architecture.md`, `src/components/NextBetDetails.jsx`, etc.) when referencing or editing.
4. Keep changes ASCII unless the target file already mixes in other characters.
5. Summaries must mention what changed, which files were touched, and any validations/tests that ran.
6. Offer next-step suggestions only when there’s a natural follow-up (tests to run, commits, deploys).

## 2. Repository Pointers For Codex
- `docs/architecture.md`: overall architecture + repo map.
- `docs/architecture/high-level-architecture.md`: deployment platform, framework versions, infrastructure context.
- `docs/brief.md`: product goals, human personas, success metrics.
- `src/pages/*.astro`: page shells and API routes (`src/pages/api/**`).
- `src/components/`: React 19 islands embedded via Astro.
- `src/lib/`: shared LibSQL/Turso helpers, auth utilities.
- `db/schema.sql`: canonical schema for the Turso database.

## 3. Request Patterns & What Codex Should Do
| User intent | Codex approach |
| --- | --- |
| “Update copy / UI” | Locate the referenced Astro/React file, edit text, ensure layout unaffected, highlight any additional context needed. |
| “Add an API” | Modify/create file under `src/pages/api`, validate request/response contracts, update docs if behavior is user-facing. |
| “Change database schema” | Edit `db/schema.sql`, describe migration implications, flag any code needing updates. |
| “Review docs” | Summarize key points, apply requested edits, ensure architectural facts stay consistent. |

## 4. Testing & Validation Guidance
- Primary tooling: `pnpm`. Common commands: `pnpm test`, `pnpm lint`, `pnpm astro build`.
- When tests can’t run (sandbox limits, missing deps), state why and outline the manual verification required.
- Capture new or altered validation steps in documentation when they impact future contributors (e.g., `docs/architecture/testing-status.md`).

## 5. Documentation Expectations On Edits
- Architecture material stays under `docs/architecture/`.
- Product/strategy notes stay under `docs/`.
- Add concise comments only when the code is not self-explanatory.
- If Codex introduces or changes workflow guidance, update this file so future sessions know the rules.

## 6. Environment Snapshot
- Stack: Astro 5.15.5, React 19, deployed via Vercel adapter with Turso LibSQL backend.
- Authentication: JWT stored in `sessionStorage`, helpers in `src/utils/auth`.
- Constraints: Sandbox may be read-only; network access is restricted unless explicitly allowed.
- Testing philosophy: run the relevant suite for any code change; for doc-only updates, state that tests were skipped.

Codex should keep these notes in mind whenever assisting. Update this guide whenever the collaboration style or technical baseline changes so the next session starts with accurate context.
