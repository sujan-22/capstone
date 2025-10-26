import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";

type Body = {
    userId: string;
    anonymize?: boolean;
    banReason?: string | null;
};

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: Body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const {
        userId,
        anonymize = true,
        banReason = "Admin-initiated deactivation",
    } = body || {};
    if (!userId)
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (session.user.id === userId) {
        return NextResponse.json(
            { error: "You cannot delete your own account." },
            { status: 400 }
        );
    }

    try {
        await auth.api.banUser({
            body: {
                userId,
                banReason: banReason || "Admin-initiated deactivation",
            },
            headers: req.headers,
        });
    } catch (e) {
        console.error("[/api/admin/users/delete] banUser failed:", e);
        return NextResponse.json(
            { error: "Failed to ban user" },
            { status: 500 }
        );
    }

    if (anonymize) {
        try {
            const res = await pool.query(
                `
        UPDATE "user" AS u
        SET
          name = 'Deleted user',
          username = CONCAT('deleted_', u.id),
          "displayUsername" = CONCAT('deleted_', u.id),
          email = CONCAT(u.id::text, '@deleted.local'),
          image = NULL
        WHERE u.id = $1
        `,
                [userId]
            );
            if (res.rowCount === 0) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }
        } catch (e) {
            console.error("[/api/admin/users/delete] anonymize failed:", e);
            return NextResponse.json(
                { error: "Failed to anonymize user after ban" },
                { status: 500 }
            );
        }
    }

    return NextResponse.json(
        {
            ok: true as const,
            userId,
            action: "anonymized_and_banned_permanently" as const,
        },
        { headers: { "Cache-Control": "no-store" } }
    );
}
