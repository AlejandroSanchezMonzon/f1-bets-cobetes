import { validetUserAdmin } from "@/utils/validation";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, Results } from "astro:db";
import type { Result } from "@/types/Result";

export const GET: APIRoute = async ({ request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const results = await db.select().from(Results);

    return res(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { idRace, idPilot1, idPilot2, idPilot3 } = body;

    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const newId = crypto.randomUUID();

    const result: Result = {
      idResult: newId,
      idRace: idRace,
      idPilot1: idPilot1,
      idPilot2: idPilot2,
      idPilot3: idPilot3
    };

    await db.insert(Results).values(result).onConflictDoUpdate({
      target: Results.idResult,
      set: { idRace, idPilot1, idPilot2, idPilot3 },
    });

    return res(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
