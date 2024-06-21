import { validateUserAdmin } from "@/utils/validations";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, Users } from "astro:db";
import type { User } from "@/types/User";
import { genSaltSync, hashSync } from "bcrypt-ts";

export const GET: APIRoute = async ({ request }) => {
  try {
    let token = request.headers.get("Authorization");
    const isUSerAdmin = await validateUserAdmin(token);

    if (!token || !isUSerAdmin) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const users = await db.select().from(Users);

    return res(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, email, password, isAdmin } = body;

    let token = request.headers.get("Authorization");
    const isUSerAdmin = await validateUserAdmin(token);

    if (!token || !isUSerAdmin) {
      return res(JSON.stringify("Not authorized."), { status: 401 });
    }

    const newId = crypto.randomUUID();
    const hashedPassword = hashSync(password, genSaltSync(10));

    const user: User = {
      idUser: newId,
      username,
      email,
      password: hashedPassword,
      isAdmin,
    };

    await db.insert(Users).values(user).onConflictDoUpdate({
      target: Users.idUser,
      set: { username, email, password, isAdmin },
    });

    return res(JSON.stringify(user), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
