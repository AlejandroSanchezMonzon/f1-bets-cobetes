# Data Architecture
## Database Schema (Turso / LibSQL)
- **drivers:** driver directory (id, name, nationality, timestamps, `deleted_at`).
- **race_weekends:** round metadata (round number, date, name, type `gp` or `sprint`).
- **results:** podium for each race weekend (positions 1-3) with FK to race.
- **qualifying:** full grid (top 20 positions) for each weekend.
- **users:** authentication source with `is_admin` flag and soft delete.
- **predictions:** user submissions per race with predicted podium and `total_points`.

Foreign keys are declared in `db/schema.sql`, but integrity relies on discipline because LibSQL relaxes enforcement. Every table includes `created_at` defaults and `deleted_at` for soft removal.

## Scoring Logic
Defined in `src/pages/api/predictions/calculate/[id].ts`:
- Grand Prix: exact position +3 points (all three correct = 10); podium presence +1.
- Sprint: exact match +1 (all three correct = 4).
- Computed totals written back to `Predictions.total_points` and consumed by `/api/ranking`.
