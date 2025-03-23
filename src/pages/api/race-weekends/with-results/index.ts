import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
  try {
    const result = await db.execute({
      sql: `
        SELECT races.id, races.round_number, races.race_date, races.race_name, races.race_type, races.created_at
        FROM race_weekends races
        INNER JOIN results rs ON races.id = rs.race_weekend_id
        WHERE races.deleted_at IS NULL
        ORDER BY races.race_date DESC
      `,
      args: [],
    });

    return res(JSON.stringify({ raceWeekends: result.rows }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
