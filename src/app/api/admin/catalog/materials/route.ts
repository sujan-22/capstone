import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";
import { updateMaterialSchema } from "@/schema/catalog";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let parsed: {
        name: string;
        description: string;
        price: number;
    };
    try {
        const body = await req.json();
        parsed = updateMaterialSchema.parse(body);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        const message = Array.isArray(e?.errors)
            ? JSON.stringify(e.errors)
            : String(e?.message ?? e);
        return NextResponse.json(
            { error: "Invalid input", message },
            { status: 400 }
        );
    }

    let client;
    try {
        client = await pool.connect();
        const q = `
          INSERT INTO case_material (name, description, price, active, created_at, updated_at)
          VALUES ($1, $2, $3, TRUE, NOW(), NOW())
          RETURNING id, name, description, price, active, created_at, updated_at
        `;
        const { rows } = await client.query(q, [
            parsed.name,
            parsed.description,
            parsed.price,
        ]);

        const r = rows[0];
        return NextResponse.json(
            {
                id: r.id,
                name: r.name,
                description: r.description,
                price: Number(r.price),
                active: !!r.active,
                createdAt: new Date(r.created_at).toISOString(),
                updatedAt: new Date(r.updated_at).toISOString(),
            },
            { status: 201 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        // Handle common constraint errors explicitly
        // 23505 = unique_violation; 23514 = check_violation; 23502 = not_null_violation
        if (err?.code === "23505") {
            return NextResponse.json(
                {
                    error: "Conflict",
                    message: "A material with this name already exists.",
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
        console.error("[material.create] error:", err);
        return NextResponse.json(
            { error: "Failed to create material" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
