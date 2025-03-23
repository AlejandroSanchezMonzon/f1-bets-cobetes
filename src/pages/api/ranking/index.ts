import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

export const GET: APIRoute = async () => {
    try {
        const seasonResult = await db.execute({
            sql: `WITH last_race AS (
                SELECT race_weekend_id
                FROM Predictions
                WHERE deleted_at IS NULL AND total_points IS NOT NULL
                ORDER BY race_weekend_id DESC
                LIMIT 1
                ),

                season_points AS (
                SELECT user_id, SUM(total_points) AS season_points
                FROM Predictions
                WHERE deleted_at IS NULL
                GROUP BY user_id
                ),

                last_points AS (
                SELECT user_id, total_points AS last_points
                FROM Predictions
                WHERE deleted_at IS NULL AND race_weekend_id = (SELECT race_weekend_id FROM last_race)
                )

                SELECT sp.user_id, sp.season_points,
                    COALESCE(lp.last_points, 0) AS last_points
                FROM season_points sp
                LEFT JOIN last_points lp ON sp.user_id = lp.user_id;`,
            args: [],
        });

        let ranking = seasonResult.rows;
        ranking.sort((a, b) => Number(b.season_points ?? 0) - Number(a.season_points ?? 0));
        const formattedRanking = ranking.map((row, index) => ({
            rank: index + 1,
            user_id: row.user_id,
            season_points: row.season_points,
            last_points: row.last_points,
        }));

        return res(JSON.stringify({ ranking: formattedRanking }), {
            status: 200
        });
    } catch (error) {
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
