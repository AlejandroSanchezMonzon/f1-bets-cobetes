import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const POST: APIRoute = async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const adminId = await checkAdmin(authHeader);
    if (!adminId) {
        return res(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const { race_weekend_id, positions } = await request.json();
        if (!race_weekend_id || !Array.isArray(positions) || positions.length !== 20) {
            return res(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 });
        }
        const sql = `
      INSERT INTO qualifying (
        race_weekend_id, position1, position2, position3, position4, position5,
        position6, position7, position8, position9, position10,
        position11, position12, position13, position14, position15,
        position16, position17, position18, position19, position20
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

        await db.execute({
            sql,
            args: [race_weekend_id, ...positions],
        });

        return res(JSON.stringify({ message: "Qualifying data inserted" }), { status: 201 });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
