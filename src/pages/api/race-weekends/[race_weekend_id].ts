import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { race_weekend_id } = params;
  const authHeader = request.headers.get("Authorization");
  const adminId = await checkAdmin(authHeader);
  if (!adminId) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT race_weekend_id, sunday_first, sunday_second, sunday_third, sprint_first, sprint_second, sprint_third, created_at FROM Results WHERE race_weekend_id = ? AND deleted_at IS NULL",
      args: [race_weekend_id as string],
    });
    if (result.rows.length === 0) {
      return res(JSON.stringify({ error: "Result not found" }), { status: 404 });
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
    const { sunday_first, sunday_second, sunday_third, sprint_first, sprint_second, sprint_third } = await request.json();
    let fields: string[] = [];
    let args: any[] = [];
    if (sunday_first !== undefined) { fields.push("sunday_first = ?"); args.push(sunday_first); }
    if (sunday_second !== undefined) { fields.push("sunday_second = ?"); args.push(sunday_second); }
    if (sunday_third !== undefined) { fields.push("sunday_third = ?"); args.push(sunday_third); }
    if (sprint_first !== undefined) { fields.push("sprint_first = ?"); args.push(sprint_first); }
    if (sprint_second !== undefined) { fields.push("sprint_second = ?"); args.push(sprint_second); }
    if (sprint_third !== undefined) { fields.push("sprint_third = ?"); args.push(sprint_third); }
    if (fields.length === 0) {
      return res(JSON.stringify({ error: "No fields to update" }), { status: 400 });
    }

    args.push(race_weekend_id);

    const updateQuery = `UPDATE Results SET ${fields.join(", ")} WHERE race_weekend_id = ?`;
    await db.execute({ sql: updateQuery, args });

    return res(JSON.stringify({ message: "Result updated" }), { status: 200 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { race_weekend_id } = params;
  const authHeader = request.headers.get("Authorization");
  const adminId = await checkAdmin(authHeader);
  if (!adminId) {
    return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    await db.execute({
      sql: "UPDATE Results SET deleted_at = CURRENT_TIMESTAMP WHERE race_weekend_id = ?",
      args: [race_weekend_id as string],
    });

    return res(JSON.stringify({ message: "Result deleted" }), { status: 200 });
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
