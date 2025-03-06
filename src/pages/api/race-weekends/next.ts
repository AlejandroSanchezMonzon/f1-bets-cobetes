import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
    try {
        const result = await db.execute({
            sql: `SELECT
                id,
                round_number,
                race_date,
                race_name,
                race_type,
                created_at
              FROM Race_Weekends
              WHERE deleted_at IS NULL
                AND race_date > CURRENT_TIMESTAMP
              ORDER BY race_date ASC
              LIMIT 1`,
            args: [],
        });

        const raceWeekend = result.rows[0];

        return res(JSON.stringify({ raceWeekend }), {
            status: 200
        });
    } catch (error) {
        console.error("Error in GET /api/race-weekends:", error);
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
