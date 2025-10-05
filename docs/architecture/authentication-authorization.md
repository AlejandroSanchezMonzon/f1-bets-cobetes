# Authentication & Authorization
- Tokens stored in `sessionStorage`; absence triggers redirects in Astro scripts.
- Protected API routes require `Authorization: Bearer <token>` header.
- Admin endpoints reuse `checkAdmin`; failure returns 401/403 and UI hides admin sections.
- JWTs expire after 24 hours; no refresh flow, so clients reauthenticate when `/api/auth/me` fails.
