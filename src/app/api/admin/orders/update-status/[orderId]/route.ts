import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";

type PatchBody = { status: unknown };

const ALLOWED_STATUSES = ["PENDING", "SHIPPED", "FULFILLED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function normalizeStatus(input: unknown): AllowedStatus | null {
    const raw = String(input ?? "").trim();
    if (!raw) return null;

    const lc = raw.toLowerCase();
    const map: Record<string, AllowedStatus> = {
        pending: "PENDING",
        shipped: "SHIPPED",
        fulfilled: "FULFILLED",
    };

    const normalized = map[lc] ?? (raw.toUpperCase() as AllowedStatus);
    return (ALLOWED_STATUSES as readonly string[]).includes(normalized)
        ? normalized
        : null;
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    // Auth (admin only)
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: PatchBody;
    const { orderId } = await params;
    try {
        body = (await req.json()) as PatchBody;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const nextStatus = normalizeStatus(body.status);
    if (!nextStatus) {
        return NextResponse.json(
            { error: "Invalid status", allowed: ALLOWED_STATUSES },
            { status: 400 }
        );
    }

    const sql = `
    UPDATE "order"
    SET order_status = $2, updated_at = NOW()
    WHERE id = $1
  `;

    const client = await pool.connect();
    try {
        const result = await client.query(sql, [orderId, nextStatus]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return new NextResponse("Updated", {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (err) {
        console.error("[/api/admin/orders/[id]/status] error:", err);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
