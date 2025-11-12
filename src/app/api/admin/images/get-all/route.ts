import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";
import { parseLimit, encodeCursor, decodeCursor } from "@/lib/utils";

type Row = {
    id: string;
    url: string;
    active: boolean;
    created_at: string;
    created_at_iso: string;
    usage_count: number;
    last_used_at: string | null;
};

export async function GET(req: Request) {
    const { user } = await getServerSideSession();
    if (!user?.id || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = parseLimit(url.searchParams.get("limit"));
    const pageSize = limit + 1;

    const decoded = decodeCursor(url.searchParams.get("cursor"));
    const cId = decoded.id;
    const cAt = decoded.createdAt
        ? /^\d{4}-\d{2}-\d{2}T/.test(decoded.createdAt)
            ? decoded.createdAt
            : new Date(decoded.createdAt).toISOString()
        : undefined;

    let client;
    try {
        client = await pool.connect();
        const base = `
      WITH usage AS (
        SELECT cd.gallery_image_id AS gid,
               COUNT(*)::int AS cnt,
               MAX(cd.created_at) AS last_used
        FROM case_design cd
        GROUP BY cd.gallery_image_id
      )
      SELECT
        gi.id,
        gi.url,
        gi.active,
        gi.created_at,
        to_char(gi.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_iso,
        COALESCE(u.cnt, 0) AS usage_count,
        u.last_used AS last_used_at
      FROM gallery_image gi
      LEFT JOIN usage u ON u.gid = gi.id
    `;

        const params = [];
        let where = "";
        if (cAt && cId) {
            where = `WHERE (gi.created_at, gi.id) < ($1::timestamptz, $2)`;
            params.push(cAt, cId);
        }

        const orderLimit = `
      ORDER BY gi.created_at DESC, gi.id DESC
      LIMIT $${params.length + 1}
    `;
        params.push(pageSize);

        const sql = base + where + orderLimit;
        const { rows } = await client.query<Row>(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const images = slice.map((r) => ({
            id: r.id,
            url: r.url,
            active: !!r.active,
            usageCount: Number(r.usage_count ?? 0),
            createdAt: r.created_at_iso,
            lastUsedAt: r.last_used_at
                ? new Date(r.last_used_at).toISOString()
                : null,
        }));

        const last = slice[slice.length - 1];
        const nextCursor = hasNext
            ? encodeCursor(last.created_at_iso, last.id)
            : null;

        return NextResponse.json({ images, nextCursor });
    } catch (e) {
        console.error("[admin/images/get-all] error:", e);
        return NextResponse.json(
            { error: "Failed to load images" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
