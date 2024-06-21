import type { Pilot } from "@/types/Pilot";
import { res } from "@/utils/api";
import { validateUserAdmin } from "@/utils/validations";
import type { APIRoute } from "astro";
import { db, eq, Pilots } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    let token = request.headers.get("Authorization");
    const isUserAdmin = await validateUserAdmin(token);

    if (!token || !isUserAdmin) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const pilot = await db
      .select()
      .from(Pilots)
      .where(eq(Pilots.idPilot, id ?? ""))
      .limit(1);

    if (!pilot) {
      return res(JSON.stringify("Pilot not found."), { status: 404 });
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
    const isUserAdmin = await validateUserAdmin(token);

    if (!token || !isUserAdmin) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const { name, team } = body;

    const user: Pilot = {
      idPilot: id ?? "",
      name,
      team,
    };

    if (!id || (await pilotsExists(id))) {
      return res(JSON.stringify("Pilot not found."), { status: 404 });
    }

    await db
      .update(Pilots)
      .set(user)
      .where(eq(Pilots.idPilot, id ?? ""));

    return res(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    let token = sessionStorage.getItem("token");
    const isUserAdmin = await validateUserAdmin(token);

    if (!token || !isUserAdmin) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;

    if (!id || (await pilotsExists(id))) {
      return res(JSON.stringify("Pilot not found."), { status: 404 });
    }

    await db.delete(Pilots).where(eq(Pilots.idPilot, id ?? ""));

    return res(JSON.stringify("Pilot deleted."), { status: 204 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function pilotsExists(id: string) {
  return (
    (await db.select().from(Pilots).where(eq(Pilots.idPilot, id)).limit(1))
      .length > 0
  );
}
