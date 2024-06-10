import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, eq, Users } from "astro:db";
import { compareSync } from "bcrypt-ts";
import { SignJWT } from "jose";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    const users = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    if (!users || users.length === 0) {
      return res(JSON.stringify("User not found."), { status: 401 });
    }

    const user = users[0];

    if (!compareSync(password, user.password)) {
      return res(JSON.stringify("Wrong email or password."), { status: 401 });
    } else {
      let token = await new SignJWT({
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1 day")
        .sign(new TextEncoder().encode());

      return res(JSON.stringify(token), { status: 200 });
    }
  } catch (error) {
    console.log(error);

    return res(JSON.stringify(`Something went wrong: ${error}`), {
      status: 500,
    });
  }
};
