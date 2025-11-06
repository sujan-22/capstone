import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";
import { normalizeHex, updateColorSchema } from "@/schema/catalog";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let parsed: { name: string; hex: string };
    try {
        const body = await req.json();

        parsed = updateColorSchema.parse({
            name: body?.name,
            hex: body?.hex,
        });
        parsed.hex = normalizeHex(parsed.hex);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        return NextResponse.json(
            { error: "Invalid input", message: e?.errors ?? String(e) },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        const q = `
      UPDATE case_color
      SET name = $1, hex = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, hex, active, created_at, updated_at
    `;
        const { rows } = await client.query(q, [parsed.name, parsed.hex, id]);
        if (!rows.length) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const r = rows[0];
        return NextResponse.json({
            id: r.id,
            name: r.name,
            hex: r.hex,
            active: !!r.active,
            createdAt: new Date(r.created_at).toISOString(),
            updatedAt: new Date(r.updated_at).toISOString(),
        });
    } catch (err) {
        console.error("[color.update] error:", err);
        return NextResponse.json(
            { error: "Failed to update color" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
