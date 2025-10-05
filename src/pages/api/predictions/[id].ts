import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { validateUser } from "@/utils/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM Predictions WHERE race_weekend_id = ? AND user_id = ? AND deleted_at IS NULL",
      args: [id as string, userId],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Predicciones no encontradas" }), { status: 404 });
    }

    const prediction = result.rows[0];
    if (prediction.user_id !== userId) {
      return res(JSON.stringify({ error: "Operación prohibida" }), { status: 403 });
    }

    return res(JSON.stringify({ prediction }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      position_predicted_first,
      position_predicted_second,
      position_predicted_third,
    } = body;
    if (
      position_predicted_first == null ||
      position_predicted_second == null ||
      position_predicted_third == null
    ) {
      return res(
        JSON.stringify({ error: "Datos de podium faltantes" }),
        { status: 400 }
      );
    }

    await db.execute({
      sql: "UPDATE Predictions SET position_predicted_first = ?, position_predicted_second = ?, position_predicted_third = ? WHERE race_weekend_id = ? AND user_id = ? AND deleted_at IS NULL",
      args: [
        position_predicted_first,
        position_predicted_second,
        position_predicted_third,
        id as string,
        userId
      ],
    });

    return res(
      JSON.stringify({ message: "Datos de la predicción actualizados" }),
      { status: 200 }
    );
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

