import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";
import { auth } from "../../../../../auth";
import z from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const emailSchema = z.email("Please enter a valid email address");

export async function POST(req: Request) {
    const { user } = await getServerSideSession();
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.newEmail === "string" ? body.newEmail : "";
    const newEmail = raw.trim();

    const validation = emailSchema.safeParse(newEmail);
    if (!validation.success) {
        return NextResponse.json(
            { error: validation.error.issues[0]?.message || "Invalid email" },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const exists = await client.query(
            `SELECT 1 FROM "user" WHERE "email" = $1 AND "id" <> $2 LIMIT 1`,
            [newEmail, user.id]
        );
        if (exists.rowCount) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        await client.query(
            `UPDATE "user"
       SET "email" = $1, "emailVerified" = FALSE, "updatedAt" = NOW()
       WHERE "id" = $2`,
            [newEmail, user.id]
        );

        await client.query("COMMIT");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("change-email (update failed):", e);
        return NextResponse.json(
            { error: "Failed to change email" },
            { status: 500 }
        );
    } finally {
        client.release();
    }

    try {
        await auth.api.sendVerificationOTP({
            body: {
                email: newEmail,
                type: "email-verification",
            },
        });
    } catch (e) {
        console.error("sendVerificationOtp failed:", e);
    }

    return NextResponse.json({ success: true });
}
