import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return res(JSON.stringify({ error: "Invalid user id" }), { status: 400 });
  }

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

  if (!requester.is_admin && requesterId.toString() !== id) {
    return res(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const result = await db.execute({
    sql: "SELECT id, username, email, is_admin FROM Users WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) {
    return res(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  const user = result.rows[0];

  return res(
    JSON.stringify({ user }),
    { status: 200 }
  );
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;

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

  if (!requester.is_admin && requesterId.toString() !== id) {
    return res(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const { username, email, is_admin } = await request.json();

  let fields: string[] = [];
  let args: any[] = [];
  if (username) {
    fields.push("username = ?");
    args.push(username);
  }
  if (email) {
    fields.push("email = ?");
    args.push(email);
  }
  if (typeof is_admin !== "undefined" && requester.is_admin) {
    fields.push("is_admin = ?");
    args.push(is_admin ? 1 : 0);
  }
  if (fields.length === 0) {
    return res(JSON.stringify({ error: "No fields to update" }), { status: 400 });
  }
  args.push(id);
  const updateQuery = `UPDATE Users SET ${fields.join(", ")} WHERE id = ?`;
  await db.execute({ sql: updateQuery, args });

  return res(JSON.stringify({ message: "User updated" }), { status: 200 });
};
