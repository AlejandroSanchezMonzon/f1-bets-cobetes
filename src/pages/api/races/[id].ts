import type { Race } from "@/types/Race";
import { res } from "@/utils/api";
import { validetUserAdmin } from "@/utils/validations";
import type { APIRoute } from "astro";
import { db, eq, Races } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const pilot = await db
      .select()
      .from(Races)
      .where(eq(Races.idRace, id ?? ""))
      .limit(1);

    if (!pilot) {
      return res(JSON.stringify("Race not found."), { status: 404 });
    }

    return res(JSON.stringify(pilot[0]), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const { name, initTime, endTime, type } = body;

    const race: Race = {
      idRace: id ?? "",
      name: name,
      initTime: initTime,
      endTime: endTime,
      type: type,
    };

    if (!id || (await raceExists(id))) {
      return res(JSON.stringify("Race not found."), { status: 404 });
    }

    await db
      .update(Races)
      .set(race)
      .where(eq(Races.idRace, id ?? ""));

    return res(JSON.stringify(race), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    let token = sessionStorage.getItem("token");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;

    if (!id || (await raceExists(id))) {
      return res(JSON.stringify("Race not found."), { status: 404 });
    }

    await db.delete(Races).where(eq(Races.idRace, id ?? ""));

    return res(JSON.stringify("Race deleted."), { status: 204 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function raceExists(id: string) {
  return (
    (await db.select().from(Races).where(eq(Races.idRace, id)).limit(1))
      .length > 0
  );
}
