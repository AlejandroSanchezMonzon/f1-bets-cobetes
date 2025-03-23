import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ }) => {
  const result = await db.execute({
    sql: "SELECT id, username FROM Users WHERE deleted_at IS NULL",
    args: [],
  });

  return res(
    JSON.stringify({ users: result.rows }),
    { status: 200 }
  );
};
