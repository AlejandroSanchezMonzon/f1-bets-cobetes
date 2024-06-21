import { res } from "@/utils/api";
import type { APIRoute } from "astro";
import { db, eq, Users } from "astro:db";
import { genSaltSync, hashSync } from "bcrypt-ts";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { email } = params;
    const users = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email ?? ""))
      .limit(1);

    const user = users[0] ?? null;

    if (!user) {
      return res(JSON.stringify("User not found."), { status: 404 });
    }

    return res(
      JSON.stringify({
        email: user.email,
        username: user.username,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const prevEmail = decodeURIComponent(params.email ?? "");
    const body = await request.json();

    const { email, password } = body;
    const hashedPassword = hashSync(password, genSaltSync(10));

    const user = {
      email,
      password: hashedPassword,
    };

    await db
      .update(Users)
      .set(user)
      .where(eq(Users.email, prevEmail ?? ""));

    return res(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.log(error);

    return res(JSON.stringify("Something went wrong."), { status: 500 });
  }
};
