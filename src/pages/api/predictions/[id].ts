import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import jwt from "jsonwebtoken";

function validateUser(authHeader: string | null): number | null {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;

  const token = authHeader.slice(7).trim();

  const secretKey = import.meta.env.JWT_SECRET;
  if (!secretKey) throw new Error("Token secreto de autenticación no encontrado");

  try {
    const decoded = jwt.verify(token, secretKey) as { userId: number };

    return decoded.userId;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM Predictions WHERE race_weekend_id = ? AND user_id = ?",
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
      sql: "UPDATE Predictions SET position_predicted_first = ?, position_predicted_second = ?, position_predicted_third = ? WHERE race_weekend_id = ? AND user_id = ?",
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
