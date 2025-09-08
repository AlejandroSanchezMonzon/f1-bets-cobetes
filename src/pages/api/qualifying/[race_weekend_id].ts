import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ params }) => {
    const { race_weekend_id } = params;

    try {
        const result = await db.execute({
            sql: "SELECT * FROM qualifying WHERE race_weekend_id = ? AND deleted_at IS NULL",
            args: [race_weekend_id as string],
        });
        if (result.rows.length === 0) {
            return res(JSON.stringify({ error: "Datos de Qualy no encontrados" }), { status: 404 });
        }

        return res(JSON.stringify({ qualifying: result.rows[0] }), {
            status: 200
        });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" + error }), { status: 500 });
    }
};

export const PATCH: APIRoute = async ({ params, request }) => {
    const { race_weekend_id } = params;
    const authHeader = request.headers.get("Authorization");
    const adminId = await checkAdmin(authHeader);
    if (!adminId) {
        return res(JSON.stringify({ error: "Operacion no autorizada" }), { status: 401 });
    }

    try {
        const { positions } = await request.json();
        if (!positions || !Array.isArray(positions) || positions.length !== 20) {
            return res(JSON.stringify({ error: "Posición de datos inválida" }), { status: 400 });
        }

        const fields = [];
        const args = [];
        for (let i = 1; i <= 20; i++) {
            fields.push(`position${i} = ?`);
            args.push(positions[i - 1]);
        }
        args.push(race_weekend_id);

        const sql = `UPDATE qualifying SET ${fields.join(", ")} WHERE race_weekend_id = ?`;
        await db.execute({ sql, args });
        return res(JSON.stringify({ message: "Qualy actualizada" }), { status: 200 });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params, request }) => {
    const { race_weekend_id } = params;
    const authHeader = request.headers.get("Authorization");
    const adminId = await checkAdmin(authHeader);
    if (!adminId) {
        return res(JSON.stringify({ error: "Operacion no autorizada" }), { status: 401 });
    }

    try {
        await db.execute({
            sql: "UPDATE qualifying SET deleted_at = CURRENT_TIMESTAMP WHERE race_weekend_id = ?",
            args: [race_weekend_id as string],
        });

        return res(JSON.stringify({ message: "Qualy eliminada" }), { status: 200 });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
