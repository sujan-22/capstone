import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";
import { decodeCursor, encodeCursor, parseLimit } from "@/lib/utils";

type ModelRow = {
    id: string;
    model_name: string;
    model_brand: string | null;
    created_at: string | Date;
    updated_at: string | Date;
    active: boolean;
};

export type PhoneModelDTO = {
    id: string;
    modelName: string;
    modelBrand: string | null;
    createdAt: string;
    updatedAt: string;
    active: boolean;
};

export type ModelsResponse = {
    models: PhoneModelDTO[];
    nextCursor: string | null;
};

export async function GET(req: Request) {
    // Admin auth
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit = parseLimit(url.searchParams.get("limit"));
    const { createdAt: cursorCreatedAt, id: cursorId } = decodeCursor(
        url.searchParams.get("cursor")
    );

    const whereParts: string[] = ["1=1"];
    const params: unknown[] = [];
    let p = 0;

    if (q) {
        // search by model name or brand
        whereParts.push(
            `(pm.model_name ILIKE '%' || $${++p} || '%' OR pm.model_brand ILIKE '%' || $${p} || '%')`
        );
        params.push(q);
    }

    if (cursorCreatedAt && cursorId) {
        // keyset pagination (created_at DESC, id DESC)
        whereParts.push(
            `(pm.created_at < $${++p}::timestamptz OR (pm.created_at = $${p}::timestamptz AND pm.id < $${++p}))`
        );
        params.push(cursorCreatedAt, cursorId);
    }

    const sql = `
    SELECT
      pm.id,
      pm.model_name,
      pm.model_brand,
      pm.created_at,
      pm.updated_at,
      pm.active
    FROM phone_model pm
    WHERE ${whereParts.join(" AND ")}
    ORDER BY pm.created_at DESC, pm.id DESC
    LIMIT $${++p}
  `;
    params.push(limit + 1);

    const client = await pool.connect();
    try {
        const { rows } = await client.query<ModelRow>(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const models: PhoneModelDTO[] = slice.map((r) => ({
            id: r.id,
            modelName: r.model_name,
            modelBrand: r.model_brand,
            createdAt: new Date(r.created_at).toISOString(),
            updatedAt: new Date(r.updated_at).toISOString(),
            active: r.active,
        }));

        const last = slice[slice.length - 1];
        const nextCursor =
            hasNext && last
                ? encodeCursor(
                      new Date(last.created_at).toISOString(),
                      String(last.id)
                  )
                : null;

        return NextResponse.json<ModelsResponse>({ models, nextCursor });
    } catch (err) {
        console.error("[/api/admin/catalog/models/get-all] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
