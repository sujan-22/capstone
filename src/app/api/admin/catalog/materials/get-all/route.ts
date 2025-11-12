import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";
import { decodeCursor, encodeCursor, parseLimit } from "@/lib/utils";

type MaterialRow = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    created_at: string | Date;
    updated_at: string | Date;
    active: boolean;
};

export type CaseMaterialDTO = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    active: boolean;
};

export type MaterialsResponse = {
    materials: CaseMaterialDTO[];
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
        // search by name or description (case-insensitive)
        whereParts.push(
            `(cm.name ILIKE '%' || $${++p} || '%' OR cm.description ILIKE '%' || $${p} || '%')`
        );
        params.push(q);
    }

    if (cursorCreatedAt && cursorId) {
        // keyset pagination
        whereParts.push(
            `(cm.created_at < $${++p}::timestamptz OR (cm.created_at = $${p}::timestamptz AND cm.id < $${++p}))`
        );
        params.push(cursorCreatedAt, cursorId);
    }

    const sql = `
    SELECT
      cm.id,
      cm.name,
      cm.price,
      cm.description,
      cm.created_at,
      cm.updated_at,
      cm.active
    FROM case_material cm
    WHERE ${whereParts.join(" AND ")}
    ORDER BY cm.created_at DESC, cm.id DESC
    LIMIT $${++p}
  `;
    params.push(limit + 1);

    let client;
    try {
        client = await pool.connect();
        const { rows } = await client.query<MaterialRow>(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const materials: CaseMaterialDTO[] = slice.map((r) => ({
            id: r.id,
            name: r.name,
            price: Number(r.price),
            description: r.description,
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

        return NextResponse.json<MaterialsResponse>({ materials, nextCursor });
    } catch (err) {
        console.error("[/api/admin/catalog/materials/get-all] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch materials" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
