import { db, eq, Users } from "astro:db";
import * as jose from "jose";

export async function validetUserAdmin(token: string | null) {
  if (!token) {
    return null;
  }

  const email = await jose.decodeJwt(token).email;

  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email as string))
    .limit(1);

  return user[0];
}

export function isValidSessionStorageToken(token: string | null) {
  try {
    if (!token) return false;

    const decodedStr = atob(token);
    if (!decodedStr) return false;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+:[^:]+$/;
    if (!regex.test(decodedStr)) return false;

    return btoa(decodedStr) === token;
  } catch (err) {
    return false;
  }
}
