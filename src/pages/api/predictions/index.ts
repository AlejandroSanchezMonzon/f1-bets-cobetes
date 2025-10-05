import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { validateUser } from "@/utils/auth";

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  let sql = "SELECT * FROM Predictions WHERE user_id = ? AND deleted_at IS NULL";
  const args: any[] = [userId];

  try {
    const result = await db.execute({ sql, args });

    return res(JSON.stringify({ predictions: result.rows }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const {
      race_weekend_id,
      position_predicted_first,
      position_predicted_second,
      position_predicted_third
    } = await request.json();
    if (!race_weekend_id || !position_predicted_first || !position_predicted_second || !position_predicted_third) {
      return res(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    await db.execute({
      sql: `INSERT INTO Predictions
            (user_id, race_weekend_id, position_predicted_first, position_predicted_second, position_predicted_third, submission_time)
            VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%S', 'now'))`,
      args: [
        userId,
        race_weekend_id,
        position_predicted_first,
        position_predicted_second,
        position_predicted_third
      ],
    });

    return res(JSON.stringify({ message: "Prediction created" }), { status: 201 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};



