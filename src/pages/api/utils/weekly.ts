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

export const GET: APIRoute = async ({ url }) => {
    try {
        const raceWeekendId = url.searchParams.get("race_weekend_id");
        if (!raceWeekendId) {
            return res(JSON.stringify({ error: "Missing race_weekend_id parameter" }), { status: 400 });
        }

        const resultQuery = await db.execute({
            sql: "SELECT * FROM Results WHERE race_weekend_id = ? AND deleted_at IS NULL",
            args: [raceWeekendId],
        });
        if (resultQuery.rows.length === 0) {
            return res(JSON.stringify({ error: "Results not found for this race weekend" }), { status: 404 });
        }
        const resultData = resultQuery.rows[0];

        const predictionsQuery = await db.execute({
            sql: "SELECT * FROM Predictions WHERE race_weekend_id = ? AND deleted_at IS NULL",
            args: [raceWeekendId],
        });
        const predictions = predictionsQuery.rows;

        // Calcular puntos para cada predicción
        const ranking = predictions.map((prediction: any) => {
            const sundayPoints = calculateSundayPoints(prediction, resultData);
            const sprintPoints = calculateSprintPoints(prediction, resultData);
            let totalPoints = sundayPoints + sprintPoints;
            // Si ambas se aciertan en su totalidad, se añade bono de 1 punto
            if (sundayPoints === 10 && sprintPoints === 4) {
                totalPoints += 1;
            }
            return {
                predictionId: prediction.id,
                userId: prediction.user_id,
                sundayPoints,
                sprintPoints,
                totalPoints,
            };
        });

        // Ordenar el ranking de mayor a menor
        ranking.sort((a, b) => b.totalPoints - a.totalPoints);

        return res(JSON.stringify({ classification: ranking }), {
            status: 200
        });
    } catch (error) {
        console.error("Error in GET /api/utils/weekly:", error);
        return res(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
