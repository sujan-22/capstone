import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { pool } from "@/lib/database/db";
import { updateColorSchema, normalizeHex } from "@/schema/catalog";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      INSERT INTO case_color (name, hex, active, created_at, updated_at)
      VALUES ($1, $2, TRUE, NOW(), NOW())
      RETURNING id, name, hex, active, created_at, updated_at
    `;
        const { rows } = await client.query(q, [parsed.name, parsed.hex]);

        const r = rows[0];
        return NextResponse.json(
            {
                id: r.id,
                name: r.name,
                hex: String(r.hex).toUpperCase(),
                active: !!r.active,
                createdAt: new Date(r.created_at).toISOString(),
                updatedAt: new Date(r.updated_at).toISOString(),
            },
            { status: 201 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err?.code === "23505") {
            // If you have unique indexes on name and/or hex, this message is friendly
            const detail = String(err?.detail ?? "").toLowerCase();
            const which = detail.includes("(name)")
                ? "name"
                : detail.includes("(hex)")
                ? "hex"
                : "name/hex";
            return NextResponse.json(
                {
                    error: "Conflict",
                    message: `A color with this ${which} already exists.`,
                },
                { status: 409 }
            );
        }
        if (err?.code === "23502" || err?.code === "23514") {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    message: "Database constraint violated.",
                },
                { status: 400 }
            );
        }
        console.error("[colors.create] error:", err);
        return NextResponse.json(
            { error: "Failed to create color" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
