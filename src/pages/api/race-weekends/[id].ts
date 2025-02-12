import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return res(JSON.stringify({ error: "Invalid race id" }), { status: 400 });
  }

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
            WHERE id = ? AND deleted_at IS NULL`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Race weekend not found" }), { status: 404 });
    }

    const raceWeekend = result.rows[0];
    return res(JSON.stringify({ raceWeekend }), {
      status: 200
    });
  } catch (error) {
    console.error("Error in GET /api/race-weekends/:id:", error);
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
