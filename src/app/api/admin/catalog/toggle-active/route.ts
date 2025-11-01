import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";

type ToggleBody = {
    entity: "color" | "finish" | "material" | "model";
    id: string;
    active: boolean;
};

const ENTITY_TABLES: Record<
    ToggleBody["entity"],
    { table: string; idCol: string }
> = {
    color: { table: "case_color", idCol: "id" },
    finish: { table: "case_finish", idCol: "id" },
    material: { table: "case_material", idCol: "id" },
    model: { table: "phone_model", idCol: "id" },
};

export async function PATCH(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: ToggleBody | null = null;
    try {
        body = (await req.json()) as ToggleBody;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const entity = body?.entity;
    const id = body?.id;
    const active = body?.active;

    if (!entity || !id || typeof active !== "boolean") {
        return NextResponse.json(
            {
                error: "Missing or invalid fields: require { entity, id, active:boolean }",
            },
            { status: 400 }
        );
    }

    const mapping = ENTITY_TABLES[entity];
    if (!mapping) {
        return NextResponse.json(
            {
                error: "Invalid entity. Use one of: color | finish | material | model",
            },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        const sql = `
      UPDATE ${mapping.table}
      SET active = $1, updated_at = NOW()
      WHERE ${mapping.idCol} = $2
      RETURNING ${mapping.idCol} AS id, active
    `;
        const params = [active, id];

        const { rows } = await client.query(sql, params);

        if (rows.length === 0) {
            return NextResponse.json(
                { error: `Item not found in ${mapping.table} with id=${id}` },
                { status: 404 }
            );
        }

        const updated = rows[0];
        return NextResponse.json({
            entity,
            table: mapping.table,
            id: String(updated.id),
            active: Boolean(updated.active),
            updatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("[/api/admin/catalog/toggle-active] error:", err);
        return NextResponse.json(
            { error: "Failed to toggle active state" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
