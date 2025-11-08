import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user } = await getServerSideSession();
    if (!user?.id || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const active = typeof body?.active === "boolean" ? body.active : undefined;
    if (typeof active !== "boolean") {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const res = await client.query(
            `UPDATE gallery_image
         SET active = $1, updated_at = NOW()
       WHERE id = $2`,
            [active, id]
        );
        if (res.rowCount === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("admin/images PATCH:", e);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
