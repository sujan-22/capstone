import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";
import { updateMaterialSchema } from "@/schema/catalog";

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

    let parsed;
    try {
        const body = await req.json();
        parsed = updateMaterialSchema.parse(body);
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
      UPDATE case_material
      SET name = $1, description = $2, price = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, description, price, active, created_at, updated_at
    `;
        const { rows } = await client.query(q, [
            parsed.name,
            parsed.description,
            parsed.price,
            id,
        ]);
        if (!rows.length) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const r = rows[0];
        return NextResponse.json({
            id: r.id,
            name: r.name,
            description: r.description,
            price: Number(r.price),
            active: !!r.active,
            createdAt: new Date(r.created_at).toISOString(),
            updatedAt: new Date(r.updated_at).toISOString(),
        });
    } catch (err) {
        console.error("[material.update] error:", err);
        return NextResponse.json(
            { error: "Failed to update material" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
