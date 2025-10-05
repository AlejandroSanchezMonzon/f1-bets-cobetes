# Technical Debt & Risks
- **Duplicate auth logic:** some endpoints still inline JWT parsing instead of using `@/utils/auth`.
- **No automated tests:** increases regression risk; consider adding Playwright E2E and targeted unit tests (scoring, ranking queries).
- **JWT expiry UX:** users experience silent expiry; adding refresh tokens or proactive logout messaging would help.
- **SQL maintenance:** raw statements require diligence when schema changes; consider centralizing column names/constants.
