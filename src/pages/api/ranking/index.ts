import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
    try {
        const seasonResult = await db.execute({
            sql: "SELECT user_id, SUM(total_points) as season_points FROM Predictions WHERE deleted_at IS NULL GROUP BY user_id",
            args: [],
        });

        let ranking = seasonResult.rows;
        ranking.sort((a, b) => Number(b.season_points ?? 0) - Number(a.season_points ?? 0));
        const formattedRanking = ranking.map((row, index) => ({
            rank: index + 1,
            user_id: row.user_id,
            season_points: row.season_points,
        }));

        return res(JSON.stringify({ ranking: formattedRanking }), {
            status: 200
        });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
