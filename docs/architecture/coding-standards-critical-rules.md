# Coding Standards (Critical Rules)
- **Type sharing:** place reusable DTOs/helpers under `src/utils` or `src/lib` to avoid duplication.
- **API responses:** always return via `res(JSON.stringify(...), { status })` for consistent headers.
- **Database calls:** use `db.execute({ sql, args })` with parameter arrays; no string interpolation.
- **State synchronization:** fire `toggleLoading` and `window.toast` around async actions for consistent user feedback.
- **Soft deletes:** never hard delete rows; set `deleted_at` and filter accordingly.
