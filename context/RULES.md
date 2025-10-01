# Rules & Conventions

## Code & Style
- **Imports**: Use the `@/` alias for internal modules. Keep import groups tidy (external dependencies → internal modules).
- **Types**: Prefer TypeScript in utilities and React components. Astro scripts can use TS when viable.
- **Comments**: Add them only when they add context (e.g., external references). Avoid trivial comments.
- **Fonts & CSS**: Stick to the defined Tailwind tokens and palette (`primary`, `secondary`, `accent`, `footer`).

## API
- Compose responses with the helper in `src/utils/api.ts` (`res(...)`).
- Validate `Authorization` headers and decode tokens before hitting the database.
- For admin endpoints reuse `checkAdmin`; for user routes reuse `validateUser` (or centralize logic in `@/utils/auth`).
- Apply soft deletes: set `deleted_at` instead of hard deleting records.
- Error handling: return `{ error: string }` with appropriate status codes (400, 401, 403, 404, 500). Log server errors when it helps debugging.

## Database
- Always send parameterized queries (`args: []`). Avoid uncontrolled string concatenation.
- When building dynamic updates check `fields.length > 0` before executing the query.
- If the schema changes, update all affected endpoints and refresh the documentation.

## Frontend
- Store the JWT in `sessionStorage`. Redirect to `/login` on protected pages when the token is missing.
- Use `LoadingOverlay` (`toggleLoading` events) for long async operations (login, admin submissions, etc.).
- Notifications: call `window.toast` with `title`, `message`, `type`, and `dismissible` per the established pattern.
- Forms: validate inputs client-side (required fields, unique podium selections) before enabling buttons.

## Roles & Security
- **Admin only**: create/update users, results, qualifying data, score recalculation.
- **Authenticated user**: create/update predictions, view history and rankings.
- UI must hide admin elements from regular users (`Header.astro`, `Administrator.astro`).

## Testing & QA
- There is no automated suite. For critical changes, run ad-hoc scripts/tests and document them in the PR.
- Manual regression checklist: login, prediction submission/edit, password update, results publication plus score recalculation.

## Documentation
- Keep this file, `ARQUITECTURE.md`, `TECHNICAL_CLUES.md`, and `AGENT.md` in sync whenever conventions evolve.
