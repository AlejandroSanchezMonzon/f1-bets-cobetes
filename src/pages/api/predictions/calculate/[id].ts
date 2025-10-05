import type { APIRoute } from "astro";
import { db } from "@/lib/turso";
import { res } from "@/utils/api";
import { validateUser } from "@/utils/auth";

function calculatePredictionPoints(pred: any, result: any, raceType: string) {
  if (raceType === "sprint") {
    let points = 0;
    let exactCount = 0;
    if (pred.position_predicted_first == result.position_first) {
      points += 1;
      exactCount++;
    }
    if (pred.position_predicted_second == result.position_second) {
      points += 1;
      exactCount++;
    }
    if (pred.position_predicted_third == result.position_third) {
      points += 1;
      exactCount++;
    }
    if (exactCount === 3) {
      return 4;
    }
    return points;
  } else {
    let points = 0;
    let exactCount = 0;
    const actualPodium = [result.position_first, result.position_second, result.position_third];

    if (pred.position_predicted_first == result.position_first) {
      points += 3;
      exactCount++;
    } else if (actualPodium.includes(pred.position_predicted_first)) {
      points += 1;
    }
    if (pred.position_predicted_second == result.position_second) {
      points += 3;
      exactCount++;
    } else if (actualPodium.includes(pred.position_predicted_second)) {
      points += 1;
    }
    if (pred.position_predicted_third == result.position_third) {
      points += 3;
      exactCount++;
    } else if (actualPodium.includes(pred.position_predicted_third)) {
      points += 1;
    }

    if (exactCount === 3) {
      return 10;
    }
    return points;
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const authHeader = request.headers.get("Authorization");
  const userId = validateUser(authHeader);
  if (!userId) {
    return res(JSON.stringify({ error: "Operación no autorizada" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { position_first, position_second, position_third } = body;
    if (position_first == null || position_second == null || position_third == null) {
      return res(
        JSON.stringify({ error: "Datos de podium faltantes" }),
        { status: 400 }
      );
    }
    const podium = {
      position_first: position_first,
      position_second: position_second,
      position_third: position_third,
    };

    const raceResult = await db.execute({
      sql: "SELECT race_type FROM Race_Weekends WHERE id = ? AND deleted_at IS NULL",
      args: [id as string],
    });
    if (raceResult.rows.length === 0) {
      return res(
        JSON.stringify({ error: "Tipo de carrera no encontrado" }),
        { status: 404 }
      );
    }
    const raceType = raceResult.rows[0].race_type as string;

    const fetchResult = await db.execute({
      sql: "SELECT * FROM Predictions WHERE race_weekend_id = ? AND deleted_at IS NULL",
      args: [id as string],
    });
    if (fetchResult.rows.length === 0) {
      return res(JSON.stringify({ error: "Predicciones no encontradas" }), { status: 404 });
    }

    for (const prediction of fetchResult.rows) {
      console.log(prediction);
      console.log(podium);
      console.log(raceType);

      const totalPoints = calculatePredictionPoints(prediction, podium, raceType);
      await db.execute({
        sql: "UPDATE Predictions SET total_points = ? WHERE id = ? AND deleted_at IS NULL",
        args: [totalPoints, prediction.id],
      });
    }

    return res(
      JSON.stringify({ message: "Puntos actualizados correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    return res(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

