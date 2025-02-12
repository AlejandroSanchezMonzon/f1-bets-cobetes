import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";

function calculateSundayPoints(prediction: any, result: any): number {
    let points = 0;
    let exactCount = 0;
    const positions = ["first", "second", "third"];
    const actualPodium = [result.sunday_first, result.sunday_second, result.sunday_third];
    for (const pos of positions) {
        const pred = prediction[`sunday_predicted_${pos}`];
        const actual = result[`sunday_${pos}`];
        if (pred === actual) {
            points += 3;
            exactCount++;
        } else if (actualPodium.includes(pred)) {
            points += 1;
        }
    }
    if (exactCount === 3) {
        points = 10;
    }
    return points;
}

function calculateSprintPoints(prediction: any, result: any): number {
    if (!result.sprint_first && !result.sprint_second && !result.sprint_third) return 0;
    let points = 0;
    let exactCount = 0;
    const positions = ["first", "second", "third"];
    for (const pos of positions) {
        const pred = prediction[`sprint_predicted_${pos}`];
        const actual = result[`sprint_${pos}`];
        if (pred === actual) {
            points += 1;
            exactCount++;
        }
    }
    if (exactCount === 3) {
        points = 4;
    }
    return points;
}

export const GET: APIRoute = async () => {
    try {
        const predictionsQuery = await db.execute({
            sql: "SELECT * FROM Predictions WHERE deleted_at IS NULL",
            args: [],
        });
        const predictions = predictionsQuery.rows;

        const raceWeekendsQuery = await db.execute({
            sql: "SELECT COUNT(*) as count FROM Race_Weekends WHERE deleted_at IS NULL",
            args: [],
        });
        const raceWeekendsCount = raceWeekendsQuery.rows[0]?.count || 0;

        const userIds = Array.from(new Set(predictions.map((p: any) => p.user_id)));
        const totalUsers = userIds.length;

        const raceWeekendIds = Array.from(new Set(predictions.map((p: any) => String(p.race_weekend_id))));
        const resultsMap: Record<string, any> = {};
        for (const id of raceWeekendIds) {
            const resultQuery = await db.execute({
                sql: "SELECT * FROM Results WHERE race_weekend_id = ? AND deleted_at IS NULL",
                args: [id],
            });
            if (resultQuery.rows.length > 0) {
                resultsMap[id] = resultQuery.rows[0];
            }
        }

        let totalPoints = 0;
        for (const prediction of predictions) {
            const result = resultsMap[String(prediction.race_weekend_id)];
            if (!result) continue;
            const sundayPoints = calculateSundayPoints(prediction, result);
            const sprintPoints = calculateSprintPoints(prediction, result);
            let points = sundayPoints + sprintPoints;
            if (sundayPoints === 10 && sprintPoints === 4) {
                points += 1;
            }
            totalPoints += points;
        }
        const averagePoints = predictions.length > 0 ? totalPoints / predictions.length : 0;

        const dashboardData = {
            totalPredictions: predictions.length,
            raceWeekendsCount,
            totalUsers,
            totalPoints,
            averagePoints,
        };

        return res(JSON.stringify({ dashboard: dashboardData }), {
            status: 200
        });
    } catch (error) {
        console.error("Error in GET /api/dashboard:", error);
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
