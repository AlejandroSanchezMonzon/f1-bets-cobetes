import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  const adminId = await checkAdmin(authHeader);
  if (!adminId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT race_weekend_id, position_first, position_second, position_third, created_at FROM Results WHERE deleted_at IS NULL",
      args: [],
    });

    return res(JSON.stringify({ results: result.rows }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  const adminId = await checkAdmin(authHeader);
  if (!adminId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const {
      race_weekend_id,
      position_first,
      position_second,
      position_third
    } = await request.json();

    if (!race_weekend_id || !position_first || !position_second || !position_third) {
      return res(JSON.stringify({ error: "Campos requeridos faltantes" }), { status: 400 });
    }

    await db.execute({
      sql: `
        INSERT INTO Results
          (race_weekend_id, position_first, position_second, position_third)
        VALUES (?, ?, ?, ?)
      `,
      args: [
        race_weekend_id,
        position_first,
        position_second,
        position_third
      ]
    });

    return res(JSON.stringify({ message: "Resultado creado" }), { status: 201 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" + error }), { status: 500 });
  }
};
