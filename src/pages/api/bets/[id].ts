import type { Bet } from "@/types/Bet";
import { res } from "@/utils/api";
import { validetUserAdmin } from "@/utils/validations";
import type { APIRoute } from "astro";
import { db, eq, Bets } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const bet = await db
      .select()
      .from(Bets)
      .where(eq(Bets.idBet, id ?? ""))
      .limit(1);

    if (!bet) {
      return res(JSON.stringify("Bet not found."), { status: 404 });
    }

    return res(JSON.stringify(bet[0]), { status: 200 });
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

    const { idUser, idRace, idPilot1, idPilot2, idPilot3 } = body;

    const bet: Bet = {
      idBet: id ?? "",
      idUser,
      idRace,
      idPilot1,
      idPilot2,
      idPilot3,
    };

    if (!id || !(await betExists(id))) {
      return res(JSON.stringify("Bet not found."), { status: 404 });
    }

    await db
      .update(Bets)
      .set(bet)
      .where(eq(Bets.idBet, id ?? ""));

    return res(JSON.stringify(bet), { status: 200 });
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

    if (!id || (await betExists(id))) {
      return res(JSON.stringify("Bet not found."), { status: 404 });
    }

    await db.delete(Bets).where(eq(Bets.idBet, id ?? ""));

    return res(JSON.stringify("Bet deleted."), { status: 204 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function betExists(id: string) {
  return (
    (await db.select().from(Bets).where(eq(Bets.idBet, id)).limit(1)).length > 0
  );
}
