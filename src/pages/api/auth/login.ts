import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { and, db, eq, Users } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;
    const user = await db
      .select()
      .from(Users)
      .where(and(eq(Users.email, email), eq(Users.password, password)))
      .limit(1);

    if (!user) {
      return res(JSON.stringify("User not found."), { status: 404 });
    }

    if (user[0].password !== password) {
      return res(JSON.stringify("Wrong email or password."), { status: 401 });
    } else {
      let token = btoa(`${user[0].email}:${user[0].password}`);
      sessionStorage.setItem("token", token);

      return res(JSON.stringify(user), { status: 200 });
    }
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
