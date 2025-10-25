import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";

type Period = "7d" | "30d" | "90d";

type StatsResponse = {
    period: Period;
    range: { start: string; end: string };
    prevRange: { start: string; end: string };
    revenue: { cents: number; prevCents: number; deltaPct: number | null };
    newCustomers: { count: number; prevCount: number; deltaPct: number | null };
    orders: { count: number; prevCount: number; deltaPct: number | null };
};

function parsePeriod(value: string | null | undefined): Period {
    if (value === "7d" || value === "30d" || value === "90d") return value;
    return "30d";
}

function subDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
}

function computeRanges(period: Period, now = new Date()) {
    const end = new Date(now); // now
    let start: Date;

    if (period === "7d") start = subDays(end, 7);
    else if (period === "90d") start = subDays(end, 90);
    else start = subDays(end, 30);

    const durationMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return {
        range: { start: start.toISOString(), end: end.toISOString() },
        prevRange: {
            start: prevStart.toISOString(),
            end: prevEnd.toISOString(),
        },
    };
}

function deltaPct(curr: number, prev: number): number | null {
    if (prev === 0) {
        if (curr === 0) return 0;
        return null;
    }
    return (curr - prev) / prev;
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({
            ok: false as const,
            status: 401,
            message: "Unauthorized",
        });
    }

    const { user } = session;
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
        return NextResponse.json({
            ok: false as const,
            status: 403,
            message: "Forbidden",
        });
    }

    const url = new URL(req.url);
    const period = parsePeriod(url.searchParams.get("period"));
    const { range, prevRange } = computeRanges(period);

    const client = await pool.connect();
    try {
        const sql = `
      WITH
      curr_orders AS (
        SELECT
          COALESCE(SUM(o.sub_total), 0) AS revenue_cents,
          COUNT(*) AS orders_count
        FROM "order" o
        WHERE o.created_at >= $1::timestamptz AND o.created_at < $2::timestamptz
      ),
      prev_orders AS (
        SELECT
          COALESCE(SUM(o.sub_total), 0) AS revenue_cents,
          COUNT(*) AS orders_count
        FROM "order" o
        WHERE o.created_at >= $3::timestamptz AND o.created_at < $4::timestamptz
      ),
      curr_users AS (
        SELECT COUNT(*)::bigint AS new_customers
        FROM "user" u
        WHERE u."createdAt" >= $1::timestamptz AND u."createdAt" < $2::timestamptz
      ),
      prev_users AS (
        SELECT COUNT(*)::bigint AS new_customers
        FROM "user" u
        WHERE u."createdAt" >= $3::timestamptz AND u."createdAt" < $4::timestamptz
      )
      SELECT
        co.revenue_cents           AS revenue_cents,
        po.revenue_cents           AS prev_revenue_cents,
        cu.new_customers           AS new_customers,
        pu.new_customers           AS prev_new_customers,
        co.orders_count            AS orders_count,
        po.orders_count            AS prev_orders_count
      FROM curr_orders co, prev_orders po, curr_users cu, prev_users pu;
    `;

        const params = [range.start, range.end, prevRange.start, prevRange.end];

        const { rows } = await client.query(sql, params);
        const row = rows[0] ?? {
            revenue_cents: 0,
            prev_revenue_cents: 0,
            new_customers: 0,
            prev_new_customers: 0,
            orders_count: 0,
            prev_orders_count: 0,
        };

        const revenueDelta = deltaPct(
            Number(row.revenue_cents),
            Number(row.prev_revenue_cents)
        );
        const customersDelta = deltaPct(
            Number(row.new_customers),
            Number(row.prev_new_customers)
        );
        const ordersDelta = deltaPct(
            Number(row.orders_count),
            Number(row.prev_orders_count)
        );

        const payload: StatsResponse = {
            period,
            range,
            prevRange,
            revenue: {
                cents: Number(row.revenue_cents) || 0,
                prevCents: Number(row.prev_revenue_cents) || 0,
                deltaPct: revenueDelta,
            },
            newCustomers: {
                count: Number(row.new_customers) || 0,
                prevCount: Number(row.prev_new_customers) || 0,
                deltaPct: customersDelta,
            },
            orders: {
                count: Number(row.orders_count) || 0,
                prevCount: Number(row.prev_orders_count) || 0,
                deltaPct: ordersDelta,
            },
        };

        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "private, max-age=30",
            },
        });
    } catch (err) {
        console.error("[/api/admin/stats] error:", err);
        return NextResponse.json(
            { error: "Failed to compute admin stats" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
