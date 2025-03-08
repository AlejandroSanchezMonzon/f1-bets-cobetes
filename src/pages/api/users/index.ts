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

  const requesterId = decoded.userId;
  const adminCheck = await db.execute({
    sql: "SELECT is_admin FROM Users WHERE id = ?",
    args: [requesterId],
  });

  if (adminCheck.rows.length === 0) {
    return res(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
  }

  const requester = adminCheck.rows[0];

  if (!requester.is_admin) {
    return res(JSON.stringify({ error: "Operación prohibida" }), { status: 403 });
  }

  const result = await db.execute({
    sql: "SELECT id, username, email, is_admin FROM Users",
    args: [],
  });

  return res(
    JSON.stringify({ users: result.rows }),
    { status: 200 }
  );
};
