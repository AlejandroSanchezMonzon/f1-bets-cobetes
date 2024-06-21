import { Users, db } from "astro:db";
import { genSaltSync, hashSync } from "bcrypt-ts";

// https://astro.build/db/seed
export default async function seed() {
  const salt = genSaltSync(10);

  const admib = {
    idUser: crypto.randomUUID(),
    username: "admin",
    email: "admin@admin.com",
    password: hashSync("admin1234", salt),
    isAdmin: true,
  };

  const user = {
    idUser: crypto.randomUUID(),
    username: "user",
    email: "user@user.com",
    password: hashSync("user1234", salt),
    isAdmin: false,
  };

  await db.insert(Users).values(admib).onConflictDoNothing();
  await db.insert(Users).values(user).onConflictDoNothing();
}
