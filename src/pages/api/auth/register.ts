import type { User } from "@/types/User";
import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, eq, Users } from "astro:db";
import { genSaltSync, hashSync } from "bcrypt-ts";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, email, password, isAdmin } = body;

    const hashedPassword = hashSync(password, genSaltSync(10));
    const newId = crypto.randomUUID();

    const user: User = {
      idUser: newId,
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin,
    };

    if (await userExists(email)) {
      return res(JSON.stringify("User already exists."), { status: 400 });
    }

    await db.insert(Users).values(user).onConflictDoNothing();

    return res(JSON.stringify(user), { status: 201 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

async function userExists(email: string) {
  return (
    (await db.select().from(Users).where(eq(Users.email, email)).limit(1))
      .length > 0
  );
}
