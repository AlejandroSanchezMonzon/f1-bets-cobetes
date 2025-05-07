import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ url }) => {
  try {
    const includeDeleted = url.searchParams.get("includeDeleted") === "true";
    const whereClause = includeDeleted
      ? ""
      : "WHERE deleted_at IS NULL";

    const result = await db.execute({
      sql: `
        SELECT id, name, nationality
        FROM Pilots
        ${whereClause}
      `,
      args: [],
    });

    return res(
      JSON.stringify({ pilots: result.rows }),
      { status: 200 }
    );
  } catch (error) {
    return res(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
};
