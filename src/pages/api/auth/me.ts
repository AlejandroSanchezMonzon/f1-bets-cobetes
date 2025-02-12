import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const token = authHeader.slice(7).trim();

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }
    let decoded: any;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      console.error("Invalid token:", err);
      return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = decoded.userId;

    const result = await db.execute({
      sql: "SELECT id, email, username FROM Users WHERE id = ?",
      args: [userId],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    const user = result.rows[0];
    return res(JSON.stringify({ user }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return res(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
};
