import type { Result } from "@/types/Result";
import { res } from "@/utils/api";
import { validetUserAdmin } from "@/utils/validations";
import type { APIRoute } from "astro";
import { db, eq, Results } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const result = await db
      .select()
      .from(Results)
      .where(eq(Results.idResult, id ?? ""))
      .limit(1);

    if (!result) {
      return res(JSON.stringify("Result not found."), { status: 404 });
    }

    return res(JSON.stringify(result[0]), { status: 200 });
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

    const { idRace, idPilot1, idPilot2, idPilot3 } = body;

    const result: Result = {
      idResult: id ?? "",
      idRace: idRace,
      idPilot1: idPilot1,
      idPilot2: idPilot2,
      idPilot3: idPilot3,
    };

    if (!id || !(await resultExists(id))) {
      return res(JSON.stringify("Result not found."), { status: 404 });
    }

    await db
      .update(Results)
      .set(result)
      .where(eq(Results.idResult, id ?? ""));

    return res(JSON.stringify(result), { status: 200 });
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

    if (!id || (await resultExists(id))) {
      return res(JSON.stringify("Result not found."), { status: 404 });
    }

    await db.delete(Results).where(eq(Results.idResult, id ?? ""));

    return res(JSON.stringify("Result deleted."), { status: 204 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function resultExists(id: string) {
  return (
    (await db.select().from(Results).where(eq(Results.idResult, id)).limit(1))
      .length > 0
  );
}
