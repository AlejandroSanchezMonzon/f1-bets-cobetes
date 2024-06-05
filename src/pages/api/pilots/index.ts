import { validetUserAdmin } from "@/utils/validation";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, Pilots } from "astro:db";
import type { Pilot } from "@/types/Pilot";

export const GET: APIRoute = async ({ request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const pilots = await db.select().from(Pilots);

    return res(JSON.stringify(pilots), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, team } = body;

    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const newId = crypto.randomUUID();

    const pilot: Pilot = {
      idPilot: newId,
      name: name,
      team: team
    };

    await db.insert(Pilots).values(pilot).onConflictDoUpdate({
      target: Pilots.idPilot,
      set: { name, team },
    });

    return res(JSON.stringify(pilot), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
