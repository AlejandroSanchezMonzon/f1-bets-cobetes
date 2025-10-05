# Naming Conventions
| Element             | Frontend pattern         | Backend pattern | Example                      |
|---------------------|--------------------------|-----------------|------------------------------|
| Components          | PascalCase               | -               | `RankingOverview.jsx`        |
| Hooks               | camelCase prefixed `use` | -               | `useRaceCountdown.ts`        |
| API routes          | -                        | kebab-case      | `/api/race-weekends/next`    |
| Database tables     | -                        | snake_case      | `race_weekends`              |
| Environment vars    | UPPER_SNAKE_CASE         | UPPER_SNAKE_CASE| `JWT_SECRET`                 |
