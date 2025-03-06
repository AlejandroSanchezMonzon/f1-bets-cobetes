import type { APIRoute } from "astro";
import { res } from "@/utils/api";

import { checkAdmin } from "@/utils/auth";

export const GET: APIRoute = async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const adminId = await checkAdmin(authHeader);
    const isAdmin = adminId !== null;
    
    return res(JSON.stringify({ isAdmin }), {
        status: 200
    });
};
