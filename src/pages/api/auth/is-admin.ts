import type { APIRoute } from "astro";
import { checkAdmin } from "@/utils/auth";
import { res } from "@/utils/api";

export const GET: APIRoute = async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const adminId = await checkAdmin(authHeader);

    return res(JSON.stringify({ isAdmin: adminId !== null }), {
        status: 200,
    });
};
