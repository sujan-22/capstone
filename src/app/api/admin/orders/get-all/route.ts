import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";
import { decodeCursor, encodeCursor, parseLimit } from "@/lib/utils";

export type OrderListItem = {
    id: string;
    orderNumber: string;
    caseDesign: {
        id: string;
        hasRequestedToSharePublicly: boolean;
        isSharedPublicly: boolean;
        croppedImageUrl: string | null;
    };
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
};

export type OrdersResponse = {
    orders: OrderListItem[];
    nextCursor: string | null;
};

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const userId = url.searchParams.get("userId") || null;
    const statusParam = (url.searchParams.get("status") || "").toUpperCase();
    const status = ["PENDING", "SHIPPED", "FULFILLED"].includes(statusParam)
        ? statusParam
        : null;
    const limit = parseLimit(url.searchParams.get("limit"));
    const { createdAt: cursorCreatedAt, id: cursorId } = decodeCursor(
        url.searchParams.get("cursor")
    );

    const whereParts: string[] = ["1=1"];
    const params: unknown[] = [];
    let p = 0;

    if (q) {
        whereParts.push(
            `(
        o.order_number ILIKE '%' || $${++p} || '%' OR
        u.name ILIKE '%' || $${p} || '%' OR
        u.username ILIKE '%' || $${p} || '%' OR
        u.email ILIKE '%' || $${p} || '%' OR
        o.id::text ILIKE '%' || $${p} || '%'
      )`
        );
        params.push(q);
    }

    if (userId) {
        whereParts.push(`o.user_id = $${++p}`);
        params.push(userId);
    }

    if (status) {
        whereParts.push(`UPPER(o.order_status) = $${++p}`);
        params.push(status);
    }

    if (cursorCreatedAt && cursorId) {
        whereParts.push(
            `(o.created_at < $${++p}::timestamptz OR (o.created_at = $${p}::timestamptz AND o.id < $${++p}))`
        );
        params.push(cursorCreatedAt, cursorId);
    }

    const sql = `
    SELECT
      o.id,
      o.order_number,
      o.case_design_id,
      o.order_status,
      o.total_amount,
      o.created_at,
      u.id  AS user_id,
      COALESCE(u.name, u.username, u.email, u.id::text) AS user_name,
      u.email AS user_email,
      cd.has_requested_to_share_publicly AS has_requested_to_share_publicly,
      cd.is_shared_publicly              AS is_shared_publicly,
      cd.cropped_image_url               AS cropped_image_url
    FROM "order" o
    LEFT JOIN "user" u ON u.id = o.user_id
    LEFT JOIN case_design cd ON cd.id = o.case_design_id
    WHERE ${whereParts.join(" AND ")}
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT $${++p}
  `;
    params.push(limit + 1);

    let client;
    try {
        client = await pool.connect();
        const { rows } = await client.query(sql, params);

        const hasNext = rows.length > limit;
        const slice = hasNext ? rows.slice(0, limit) : rows;

        const orders: OrderListItem[] = slice.map((r) => ({
            id: r.id,
            orderNumber: r.order_number,
            caseDesign: {
                id: r.case_design_id,
                hasRequestedToSharePublicly: r.has_requested_to_share_publicly,
                isSharedPublicly: r.is_shared_publicly,
                croppedImageUrl: r.cropped_image_url ?? null,
            },
            status: r.order_status,
            totalAmount: Number(r.total_amount ?? 0),
            createdAt: new Date(r.created_at).toISOString(),
            customer: {
                id: r.user_id,
                name: r.user_name || "(no name)",
                email: r.user_email,
            },
        }));

        const lastRow = slice[slice.length - 1];
        const nextCursor = hasNext
            ? encodeCursor(
                  new Date(lastRow.created_at).toISOString(),
                  String(lastRow.id)
              )
            : null;

        const payload: OrdersResponse = { orders, nextCursor };
        return NextResponse.json(payload);
    } catch (err) {
        console.error("[/api/admin/orders/get-all] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
