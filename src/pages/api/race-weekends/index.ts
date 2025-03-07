import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
  try {
    const result = await db.execute({
      sql: "SELECT id, round_number, race_date, race_name, race_type, created_at FROM race_weekends WHERE deleted_at IS NULL",
      args: [],
    });

    return res(JSON.stringify({ raceWeekends: result.rows }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
