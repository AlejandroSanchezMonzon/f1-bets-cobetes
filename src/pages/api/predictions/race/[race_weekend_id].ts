import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ params }) => {
  const { race_weekend_id } = params;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM Predictions WHERE race_weekend_id = ? AND deleted_at IS NULL",
      args: [race_weekend_id as string],
    });

    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Predicciones no encontradas" }), { status: 404 });
    }

    return res(JSON.stringify({ predictions: result.rows }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
