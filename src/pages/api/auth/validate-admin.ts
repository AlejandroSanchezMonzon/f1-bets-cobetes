import type { APIRoute } from "astro";
import { db, eq, Users } from "astro:db";
import { decodeJwt } from "jose";
import { res } from "@/utils/api";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return res(JSON.stringify({ isAdmin: false }), { status: 400 });
    }

    const { email } = decodeJwt(token);

    if (!email) {
      return res(JSON.stringify({ isAdmin: false }), { status: 401 });
    }

    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email as string))
      .limit(1);

    if (user.length === 0 || !user[0].isAdmin) {
      return res(JSON.stringify({ isAdmin: false }), { status: 401 });
    }

    return res(JSON.stringify({ isAdmin: true }), { status: 200 });
  } catch (error) {
    console.log(error);
    return res(JSON.stringify({ isAdmin: false }), { status: 500 });
  }
};
