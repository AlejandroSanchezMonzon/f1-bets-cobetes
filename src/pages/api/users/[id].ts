import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  const userQuery = await db.execute({
    sql: "SELECT username FROM Users WHERE id = ? AND deleted_at IS NULL",
    args: [id as string],
  });

  if (userQuery.rows.length === 0) {
    return res(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
  }

  const { username } = userQuery.rows[0];
  return res(JSON.stringify({ username }), { status: 200 });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
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
    sql: "SELECT is_admin FROM Users WHERE id = ? AND deleted_at IS NULL",
    args: [requesterId],
  });
  if (adminCheck.rows.length === 0) {
    return res(JSON.stringify({ error: "Useuario no encontrado" }), { status: 404 });
  }

  const requester = adminCheck.rows[0];
  if (!requester.is_admin && requesterId.toString() !== id) {
    return res(JSON.stringify({ error: "Operación prohibida" }), { status: 403 });
  }

  const { username, email, is_admin, password } = await request.json();
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

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push("password = ?");
    args.push(hashedPassword);
  }

  if (fields.length === 0) {
    return res(JSON.stringify({ error: "No hay campos para actualizar" }), { status: 400 });
  }

  args.push(id);
  const updateQuery = `UPDATE Users SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`;

  await db.execute({ sql: updateQuery, args });

  return res(JSON.stringify({ message: "Usuario actualizado" }), { status: 200 });
};
