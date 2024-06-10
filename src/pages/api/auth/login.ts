import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { and, db, eq, Users } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;
    const users = await db
      .select()
      .from(Users)
      .where(and(eq(Users.email, email), eq(Users.password, password)))
      .limit(1);

    if (!users || users.length === 0) {
      return res(JSON.stringify("User not found."), { status: 401 });
    }

    const user = users[0];

    if (user.password !== password) {
      return res(JSON.stringify("Wrong email or password."), { status: 401 });
    } else {
      let token = btoa(`${user.email}:${user.password}`);

      return res(JSON.stringify(token), { status: 200 });
    }
  } catch (error) {
    console.log(error);

    return res(JSON.stringify(`Something went wrong: ${error}`), {
      status: 500,
    });
  }
};
