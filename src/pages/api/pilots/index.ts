import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
  try {
    const result = await db.execute({
      sql: "SELECT id, name, nationality FROM Pilots WHERE deleted_at IS NULL",
      args: [],
    });

    return res(JSON.stringify({ pilots: result.rows }), {
      status: 200,
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
