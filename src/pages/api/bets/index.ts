import { validetUserAdmin } from "@/utils/validation";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, Bets } from "astro:db";
import type { Bet } from "@/types/Bet";

export const GET: APIRoute = async ({ request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const bets = await db.select().from(Bets);

    return res(JSON.stringify(bets), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { idUser, idRace, idPilot1, idPilot2, idPilot3 } = body;

    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const newId = crypto.randomUUID();

    const bet: Bet = {
      idBet: newId,
      idUser,
      idRace,
      idPilot1,
      idPilot2,
      idPilot3
    };

    await db.insert(Bets).values(bet).onConflictDoUpdate({
      target: Bets.idBet,
      set: { idUser, idRace, idPilot1, idPilot2, idPilot3 },
    });

    return res(JSON.stringify(bet), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
