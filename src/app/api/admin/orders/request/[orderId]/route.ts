import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../../auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    // Auth (admin only)
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const selectSql = `
      SELECT 
        o.id                           AS order_id,
        o.case_design_id               AS case_design_id,
        cd.has_requested_to_share_publicly,
        cd.is_shared_publicly
      FROM "order" o
      JOIN case_design cd ON cd.id = o.case_design_id
      WHERE o.id = $1
      FOR UPDATE
    `;
        const { rows } = await client.query(selectSql, [orderId]);

        if (rows.length === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const row = rows[0] as {
            order_id: string;
            case_design_id: string;
            has_requested_to_share_publicly: boolean | null;
            is_shared_publicly: boolean | null;
        };

        if (!row.has_requested_to_share_publicly) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                {
                    error: "Design was not requested to be shared publicly; refusing to publish.",
                },
                { status: 400 }
            );
        }

        if (row.is_shared_publicly) {
            await client.query("COMMIT");
            return NextResponse.json({
                orderId: row.order_id,
                caseDesignId: row.case_design_id,
                wasUpdated: false,
                isSharedPublicly: true,
            });
        }

        const updateSql = `
      UPDATE case_design
      SET is_shared_publicly = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING id, has_requested_to_share_publicly, is_shared_publicly
    `;
        const updateRes = await client.query(updateSql, [row.case_design_id]);

        await client.query("COMMIT");

        const updated = updateRes.rows[0];
        return NextResponse.json({
            orderId: row.order_id,
            caseDesignId: updated.id,
            wasUpdated: true,
            isSharedPublicly: updated.is_shared_publicly === true,
        });
    } catch (err) {
        try {
            await client.query("ROLLBACK");
        } catch {}
        console.error("[/api/admin/orders/[orderId]/share] error:", err);
        return NextResponse.json(
            { error: "Failed to publish design" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
