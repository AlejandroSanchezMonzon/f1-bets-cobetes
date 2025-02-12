import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { validateUser } from "@/utils/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return res(JSON.stringify({ error: "Invalid prediction id" }), { status: 400 });
  }

  const authHeader = request.headers.get("Authorization");

  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM Predictions WHERE id = ?",
      args: [id],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Prediction not found" }), { status: 404 });
    }
    const prediction = result.rows[0];
    // Verificar que la predicción pertenece al usuario autenticado
    if (prediction.user_id !== userId) {
      return res(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
    return res(JSON.stringify({ prediction }), {
      status: 200
    });
  } catch (error) {
    console.error("Error in GET /api/predictions/:id:", error);
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return res(JSON.stringify({ error: "Invalid prediction id" }), { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const fetchResult = await db.execute({
      sql: "SELECT user_id FROM Predictions WHERE id = ?",
      args: [id],
    });
    if (fetchResult.rows.length === 0) {
      return res(JSON.stringify({ error: "Prediction not found" }), { status: 404 });
    }
    const prediction = fetchResult.rows[0];
    if (prediction.user_id !== userId) {
      return res(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const {
      sunday_predicted_first,
      sunday_predicted_second,
      sunday_predicted_third,
      sprint_predicted_first,
      sprint_predicted_second,
      sprint_predicted_third,
    } = await request.json();

    let fields: string[] = [];
    let args: any[] = [];
    if (sunday_predicted_first !== undefined) {
      fields.push("sunday_predicted_first = ?");
      args.push(sunday_predicted_first);
    }
    if (sunday_predicted_second !== undefined) {
      fields.push("sunday_predicted_second = ?");
      args.push(sunday_predicted_second);
    }
    if (sunday_predicted_third !== undefined) {
      fields.push("sunday_predicted_third = ?");
      args.push(sunday_predicted_third);
    }
    if (sprint_predicted_first !== undefined) {
      fields.push("sprint_predicted_first = ?");
      args.push(sprint_predicted_first);
    }
    if (sprint_predicted_second !== undefined) {
      fields.push("sprint_predicted_second = ?");
      args.push(sprint_predicted_second);
    }
    if (sprint_predicted_third !== undefined) {
      fields.push("sprint_predicted_third = ?");
      args.push(sprint_predicted_third);
    }
    if (fields.length === 0) {
      return res(JSON.stringify({ error: "No fields to update" }), { status: 400 });
    }

    args.push(id);
    const updateQuery = `UPDATE Predictions SET ${fields.join(", ")} WHERE id = ?`;
    await db.execute({ sql: updateQuery, args });

    return res(JSON.stringify({ message: "Prediction updated" }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/predictions/:id:", error);
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
