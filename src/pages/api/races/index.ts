import { validetUserAdmin } from "@/utils/validation";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, Races } from "astro:db";
import type { Race } from "@/types/Race";

export const GET: APIRoute = async ({ request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const races = await db.select().from(Races);

    return res(JSON.stringify(races), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, initTime, endTime, type } = body;

    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const newId = crypto.randomUUID();

    const race: Race = {
      idRace: newId,
      name,
      initTime,
      endTime,
      type,
    };

    await db.insert(Races).values(race).onConflictDoUpdate({
      target: Races.idRace,
      set: { name, initTime, endTime, type },
    });

    return res(JSON.stringify(race), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
