# Frontend Architecture
## Routing and Layout
- Astro routes (`src/pages/*.astro`) define top-level pages: `/landing`, `/login`, `/apuestas`, `/perfil`, `/admin`, etc.
- `Layout.astro` wraps pages with header and footer components. Navigation state toggles admin links based on `/api/auth/is-admin` response.

## React Islands & State Patterns
- **RankingOverview.jsx:** fetches `/api/ranking` plus `/api/users/usernames`, merges them, and renders table with trend data.
- **NextBetDetails.jsx:** orchestrates race metadata, prediction state, weather lookup, and handles locking logic. Dispatches `toggleLoading` events around async calls and uses `window.toast` for feedback.
- **ResultsForm.astro** and **QualyForm.astro:** embed React forms for admins to publish official data; use shared toast/loading helpers.
- **LoadingOverlay.tsx:** listens for global `toggleLoading` events to show/hide overlay; ensures consistent UX across pages.

## Styling
- Tailwind CSS 4 via Vite plugin; tokens declared inside `src/styles/global.css` using `@theme` (primary, secondary, accent, footer colors and font families).
- F1-inspired font files in `public/fonts/` registered with `@font-face`.
