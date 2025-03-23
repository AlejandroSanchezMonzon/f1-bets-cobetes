import { db } from "@/lib/turso";
import jwt from "jsonwebtoken";

export async function checkAdmin(authHeader: string | null): Promise<number | null> {
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        return null;
    }
    const token = authHeader.slice(7).trim();
    const secretKey = import.meta.env.JWT_SECRET;
    if (!secretKey) throw new Error("Token secreto de autenticación no encontrado");

    try {
        const decoded = jwt.verify(token, secretKey) as { userId: number; is_admin: boolean };
        const result = await db.execute({
            sql: "SELECT is_admin FROM Users WHERE id = ? AND deleted_at IS NULL",
            args: [decoded.userId],
        });
        if (result.rows.length === 0) return null;
        const requester = result.rows[0];
        return requester.is_admin ? decoded.userId : null;
    } catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}

export function validateUser(authHeader: string | null): number | null {
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        return null;
    }
    const token = authHeader.slice(7).trim();
    const secretKey = import.meta.env.JWT_SECRET;
    if (!secretKey) throw new Error("Token secreto de autenticación no encontrado");
    try {
        const decoded = jwt.verify(token, secretKey) as { userId: number };
        return decoded.userId;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}
