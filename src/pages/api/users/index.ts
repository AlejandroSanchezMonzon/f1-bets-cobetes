import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) throw new Error("Missing JWT_SECRET in environment variables");

  let decoded: any;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (error) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const requesterId = decoded.userId;
  const adminCheck = await db.execute({
    sql: "SELECT is_admin FROM Users WHERE id = ?",
    args: [requesterId],
  });

  if (adminCheck.rows.length === 0) {
    return res(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const requester = adminCheck.rows[0];

  if (!requester.is_admin) {
    return res(JSON.stringify({ error: "Forbidden" }), { status: 403 });
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
