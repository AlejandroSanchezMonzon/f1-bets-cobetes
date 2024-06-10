import { db, eq, Users } from "astro:db";
import { decodeJwt } from "jose";

export async function validetUserAdmin(token: string | null) {
  if (!token) {
    return null;
  }

  const email = await decodeJwt(token).email;

  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email as string))
    .limit(1);

  return user[0];
}
