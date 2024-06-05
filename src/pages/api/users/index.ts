import type { APIRoute } from "astro";
import { db, Usuario } from "astro:db";

const res = (
	body: string,
	{ status, statusText, headers }: { status?: number; statusText?: string; headers?: Headers }
) => new Response(body, { status, statusText, headers })

export const GET: APIRoute = async ({ request }) => {
    try {
      const users = await db.select().from(Usuario);
      return new Response(JSON.stringify(users), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
        console.log(error)
      return res(JSON.stringify('Something went wrong.'), { status: 500 });
    }

    return res(JSON.stringify(''), { status: 200 });
};