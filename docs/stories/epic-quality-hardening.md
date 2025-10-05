# F1 Bets Cobetes Quality Hardening

## Story Overview

This epic ensures the live application remains maintainable, fully documented, and consistent in tone and conventions. We focus on unifying language (English), consolidating helper logic, refreshing documentation, and confirming all standards are enforced.

## Goals

- Eliminate the remaining Spanish/English mix across source code and documentation while keeping end-user UI copy intentionally in Spanish.
- Ensure coding standards are explicit, discoverable, and enforced.
- Refactor duplicated logic (e.g., auth helper duplication) and align naming conventions.
- Document the state of the system so future contributors can ramp up quickly.
- Run a validation pass to confirm the application still behaves as expected.

## Acceptance Criteria

- Source code, comments, and documentation are in English; UI strings remain Spanish unless a business reason dictates otherwise.
- Coding standards live in `docs/architecture/coding-standards-critical-rules.md`, reflected in README and quick-start notes.
- Duplicate helpers (auth, shared utilities) are consolidated; naming conventions align with docs.
- Documentation index (`docs/index.md`) stays in sync, pointing to refreshed guides.
- Manual regression checklist completed; any automated scripts updated or added where feasible.

---

## Story 1.1: Source Consistency Audit

- Inventory non-English strings across source code, API responses, and documentation (UI strings are expected to stay in Spanish); log findings.
- Identify duplicated or inconsistent helper functions (e.g., token validation).
- Produce a 'cleanup map' listing files to fix in subsequent stories.

### Acceptance Criteria
1. A documented checklist (commit or issue note) listing files needing language or naming cleanup.
2. Summary of duplicated utilities identified for consolidation.

---

## Story 1.2: Refactor & Translation Implementation

- Apply translations and terminology alignment based on the audit.
- Consolidate authentication helpers into a single shared module; update all imports.
- Align naming conventions (file, function, variable) with the documented standards.

### Acceptance Criteria
1. All items flagged in Story 1.1 are addressed or moved to a follow-up task with rationale.
2. Auth helper duplication removed; all endpoints use the shared helpers.
3. Linting/formatting passes cleanly.

---

## Story 1.3: Documentation Refresh

- Update `docs/index.md` links and descriptions after cleanup.
- Ensure README, architecture shards, and other docs are up to date and cross-referenced.
- Add/clarify a 'developer quick start' section summarizing conventions and setup steps.

### Acceptance Criteria
1. README references only current documentation paths (no `/context`).
2. `docs/index.md` includes new/updated descriptions reflecting the refreshed docs.
3. Quick-start highlights coding standards and testing expectations.

---

## Story 1.4: Standards Enforcement & Testing

- Verify coding standards in `docs/architecture/coding-standards-critical-rules.md`; add missing rules.
- Introduce lint/test scripts or instructions as needed.
- Execute a manual regression checklist; log findings.

### Acceptance Criteria
1. Coding standards document updated with any missing rules discovered during refactor.
2. Contributing instructions mention lint/test steps.
3. Manual regression results captured; outstanding issues logged.

---

## Ready for Development

- When Stories 1.1-1.4 are complete and validated.
- All documentation references point to the `docs` folder and are in English.
- QA sign-off recommended after regression.
