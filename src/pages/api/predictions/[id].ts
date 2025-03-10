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
      sql: "SELECT * FROM Predictions WHERE id = ? AND user_id = ?",
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
    const fetchResult = await db.execute({
      sql: "SELECT user_id FROM Predictions WHERE id = ?",
      args: [id as string],
    });
    if (fetchResult.rows.length === 0) {
      return res(JSON.stringify({ error: "Predicciones no encontradas" }), { status: 404 });
    }

    const prediction = fetchResult.rows[0];
    if (prediction.user_id !== userId) {
      return res(JSON.stringify({ error: "Operación prohibida" }), { status: 403 });
    }

    const {
      position_predicted_first,
      position_predicted_second,
      position_predicted_third,
      total_points
    } = await request.json();
    let fields: string[] = [];
    let args: any[] = [];
    if (position_predicted_first !== undefined) {
      fields.push("position_predicted_first = ?");
      args.push(position_predicted_first);
    }
    if (position_predicted_second !== undefined) {
      fields.push("position_predicted_second = ?");
      args.push(position_predicted_second);
    }
    if (position_predicted_third !== undefined) {
      fields.push("position_predicted_third = ?");
      args.push(position_predicted_third);
    }
    if (total_points !== undefined) {
      fields.push("total_points = ?");
      args.push(total_points);
    }
    if (fields.length === 0) {
      return res(JSON.stringify({ error: "No hay campos para actualizar" }), { status: 400 });
    }

    args.push(id);

    const updateQuery = `UPDATE Predictions SET ${fields.join(", ")} WHERE id = ?`;

    await db.execute({ sql: updateQuery, args });

    return res(JSON.stringify({ message: "Predicción actualizada" }), { status: 200 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
