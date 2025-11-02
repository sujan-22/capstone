import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";
import { createPhoneModelSchema } from "@/schema/catalog";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let parsed: { modelName: string; modelBrand: string };
    try {
        const body = await req.json();
        parsed = createPhoneModelSchema.parse(body);
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
      INSERT INTO phone_model (model_name, model_brand, active, created_at, updated_at)
      VALUES ($1, $2, TRUE, NOW(), NOW())
      RETURNING id, model_name, model_brand, active, created_at, updated_at
    `;
        const { rows } = await client.query(q, [
            parsed.modelName,
            parsed.modelBrand,
        ]);

        const r = rows[0];
        return NextResponse.json(
            {
                id: r.id,
                modelName: r.model_name,
                modelBrand: r.model_brand,
                active: !!r.active,
                createdAt: new Date(r.created_at).toISOString(),
                updatedAt: new Date(r.updated_at).toISOString(),
            },
            { status: 201 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        // 23505 = unique_violation; 23514 = check_violation; 23502 = not_null_violation
        if (err?.code === "23505") {
            return NextResponse.json(
                {
                    error: "Conflict",
                    message:
                        "A phone model with this name and brand already exists.",
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
        console.error("[model.create] error:", err);
        return NextResponse.json(
            { error: "Failed to create phone model" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
