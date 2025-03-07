import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { race_weekend_id } = params;

  try {
    const result = await db.execute({
      sql: "SELECT race_weekend_id, sunday_first, sunday_second, sunday_third, sprint_first, sprint_second, sprint_third, created_at FROM Results WHERE race_weekend_id = ? AND deleted_at IS NULL",
      args: [race_weekend_id as string],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Result not found" }), { status: 404 });
    }

    return res(JSON.stringify({ result: result.rows[0] }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
