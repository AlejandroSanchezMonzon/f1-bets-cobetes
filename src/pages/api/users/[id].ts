import type { User } from "@/types/User";
import { res } from "@/utils/api";
import { validetUserAdmin } from "@/utils/validation";
import type { APIRoute } from "astro";
import { db, eq, Users } from "astro:db";
import { genSaltSync, hashSync } from "bcrypt-ts";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    let token = request.headers.get("Authorization");
    const sessionUser = await validetUserAdmin(token);

    if (!token || !sessionUser || sessionUser?.isAdmin !== true) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const { id } = params;
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.idUser, id ?? ""))
      .limit(1);

    if (!user) {
      return res(JSON.stringify("User not found."), { status: 404 });
    }

    return res(JSON.stringify(user[0]), { status: 200 });
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

    const { username, email, password, isAdmin } = body;
    const hashedPassword = hashSync(password, genSaltSync(10));

    const user: User = {
      idUser: id ?? "",
      username,
      email,
      password: hashedPassword,
      isAdmin,
    };

    if (!id || (await raceExists(id))) {
      return res(JSON.stringify("User not found."), { status: 404 });
    }

    await db
      .update(Users)
      .set(user)
      .where(eq(Users.idUser, id ?? ""));

    return res(JSON.stringify(user), { status: 200 });
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
      return res(JSON.stringify("User not found."), { status: 404 });
    }

    await db.delete(Users).where(eq(Users.idUser, id ?? ""));

    return res(JSON.stringify("User deleted."), { status: 204 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function raceExists(id: string) {
  return (
    (await db.select().from(Users).where(eq(Users.idUser, id)).limit(1))
      .length > 0
  );
}
