import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";
import { decodeCursor, encodeCursor, parseLimit } from "@/lib/utils";

type ColorRow = {
    id: string;
    name: string;
    hex: string;
    created_at: string | Date;
    updated_at: string | Date;
    active: boolean;
};

export type CaseColorDTO = {
    id: string;
    name: string;
    hex: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
};

export type ColorsResponse = {
    colors: CaseColorDTO[];
    nextCursor: string | null;
};

export async function GET(req: Request) {
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
        whereParts.push(
            `(cc.name ILIKE '%' || $${++p} || '%' OR cc.hex ILIKE '%' || $${p} || '%')`
        );
        params.push(q);
    }

    if (cursorCreatedAt && cursorId) {
        whereParts.push(
            `(cc.created_at < $${++p}::timestamptz OR (cc.created_at = $${p}::timestamptz AND cc.id < $${++p}))`
        );
        params.push(cursorCreatedAt, cursorId);
    }

    const sql = `
    SELECT
      cc.id,
      cc.name,
      cc.hex,
      cc.created_at,
      cc.updated_at,
      cc.active
    FROM case_color cc
    WHERE ${whereParts.join(" AND ")}
    ORDER BY cc.created_at DESC, cc.id DESC
    LIMIT $${++p}
  `;
    params.push(limit + 1);

    let client;
    try {
        client = await pool.connect();

        const { rows } = await client.query<ColorRow>(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const colors: CaseColorDTO[] = slice.map((r) => ({
            id: r.id,
            name: r.name,
            hex: r.hex,
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

        return NextResponse.json<ColorsResponse>({ colors, nextCursor });
    } catch (err) {
        console.error("[/api/admin/catalog/colors/get-all] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch colors" },
            { status: 500 }
        );
    } finally {
        if (client) client.release?.();
    }
}
