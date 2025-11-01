import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";

type FinishRow = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    created_at: string | Date;
    updated_at: string | Date;
    active: boolean;
};

export type CaseFinishDTO = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    active: boolean;
};

export type FinishesResponse = {
    finishes: CaseFinishDTO[];
    nextCursor: string | null;
};

function parseLimit(value: string | null): number {
    const n = Number(value ?? 20);
    if (!Number.isFinite(n)) return 20;
    return Math.min(100, Math.max(1, Math.floor(n)));
}

function encodeCursor(createdAtISO: string, id: string) {
    return Buffer.from(`${createdAtISO}|${id}`, "utf-8").toString("base64url");
}

function decodeCursor(cursor: string | null): {
    createdAt?: string;
    id?: string;
} {
    if (!cursor) return {};
    try {
        const raw = Buffer.from(cursor, "base64url").toString("utf-8");
        const [createdAtISO, id] = raw.split("|");
        if (!createdAtISO || !id) return {};
        return { createdAt: createdAtISO, id };
    } catch {
        return {};
    }
}

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
            `(cf.name ILIKE '%' || $${++p} || '%' OR cf.description ILIKE '%' || $${p} || '%')`
        );
        params.push(q);
    }

    if (cursorCreatedAt && cursorId) {
        // keyset pagination
        whereParts.push(
            `(cf.created_at < $${++p}::timestamptz OR (cf.created_at = $${p}::timestamptz AND cf.id < $${++p}))`
        );
        params.push(cursorCreatedAt, cursorId);
    }

    const sql = `
    SELECT
      cf.id,
      cf.name,
      cf.price,
      cf.description,
      cf.created_at,
      cf.updated_at,
      cf.active
    FROM case_finish cf
    WHERE ${whereParts.join(" AND ")}
    ORDER BY cf.created_at DESC, cf.id DESC
    LIMIT $${++p}
  `;
    params.push(limit + 1);

    const client = await pool.connect();
    try {
        const { rows } = await client.query<FinishRow>(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const finishes: CaseFinishDTO[] = slice.map((r) => ({
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

        return NextResponse.json<FinishesResponse>({ finishes, nextCursor });
    } catch (err) {
        console.error("[/api/admin/catalog/finishes/get-all] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch finishes" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
