import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ url }) => {
    const race_weekend_id = url.searchParams.get("race_weekend_id");
    if (!race_weekend_id) {
        return res(JSON.stringify({ error: "Missing race_weekend_id parameter" }), { status: 400 });
    }

    try {
        const predictionsResult = await db.execute({
            sql: "SELECT user_id, total_points FROM Predictions WHERE race_weekend_id = ? AND deleted_at IS NULL",
            args: [race_weekend_id],
        });
        const predictions = predictionsResult.rows;
        predictions.sort((a, b) => {
            const totalA = Number(a.total_points ?? 0);
            const totalB = Number(b.total_points ?? 0);
            return totalB - totalA;
        });
        const ranking = predictions.map((pred, index) => ({
            rank: index + 1,
            user_id: pred.user_id,
            total_points: pred.total_points,
        }));

        return res(JSON.stringify({ ranking }), {
            status: 200
        });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
