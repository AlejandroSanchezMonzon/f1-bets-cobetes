import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  const secretKey = import.meta.env.JWT_SECRET;
  if (!secretKey) throw new Error("Token secreto de autenticación no encontrado");

  let decoded: any;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (error) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  const result = await db.execute({
    sql: "SELECT id, username, email FROM Users WHERE id = ?",
    args: [decoded.userId],
  });
  if (result.rows.length === 0) {
    return res(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return res(JSON.stringify({ user: result.rows[0] }), {
    status: 200,
  });
};
