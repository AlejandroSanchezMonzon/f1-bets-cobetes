import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return res(JSON.stringify({ error: "ID de drivero faltante" }), { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT id, name, nationality FROM Drivers WHERE id = ? AND deleted_at IS NULL",
      args: [id],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Drivero no encontrado" }), { status: 404 });
    }

    return res(JSON.stringify({ driver: result.rows[0] }), {
      status: 200
    });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
