import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { race_weekend_id } = params;

  try {
    const result = await db.execute({
      sql: "SELECT race_weekend_id, position_first, position_second, position_third created_at FROM Results WHERE race_weekend_id = ? AND deleted_at IS NULL",
      args: [race_weekend_id as string],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Resultado no encontrado" }), { status: 404 });
    }

    return res(JSON.stringify({ result: result.rows[0] }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { race_weekend_id } = params;
  const authHeader = request.headers.get("Authorization");
  const adminId = await checkAdmin(authHeader);
  if (!adminId) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const {
      position_first,
      position_second,
      position_third
    } = await request.json();

    let fields: string[] = [];
    let args: any[] = [];

    if (position_first !== undefined) { fields.push("position_first = ?"); args.push(position_first); }
    if (position_second !== undefined) { fields.push("position_second = ?"); args.push(position_second); }
    if (position_third !== undefined) { fields.push("position_third = ?"); args.push(position_third); }

    if (fields.length === 0) {
      return res(JSON.stringify({ error: "No hay campos para actualizar" }), { status: 400 });
    }

    args.push(race_weekend_id);
    const sql = `UPDATE Results SET ${fields.join(", ")} WHERE race_weekend_id = ?`;
    await db.execute({ sql, args });
    return res(JSON.stringify({ message: "Resultados actualizados" }), { status: 200 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
