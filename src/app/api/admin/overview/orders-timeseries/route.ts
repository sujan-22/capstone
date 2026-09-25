import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { auth } from "../../../../../../auth";

type Period = "7d" | "30d" | "90d";

function parsePeriod(value: string | null | undefined): Period {
    return value === "7d" || value === "30d" || value === "90d" ? value : "30d";
}

function subDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
}

function computeRanges(period: Period, now = new Date()) {
    const end = new Date(now);
    const start =
        period === "7d"
            ? subDays(end, 7)
            : period === "90d"
            ? subDays(end, 90)
            : subDays(end, 30);

    return {
        range: { start: start.toISOString(), end: end.toISOString() },
    };
}
type OrdersTimeseriesResponse = {
    period: Period;
    range: { start: string; end: string };
    timezone: string; // for client to interpret bucket boundaries
    buckets: Array<{ day: string; count: number; revenue: number }>;
    orders: Array<{
        id: string;
        createdAt: string; // ISO
        customerName: string;
        amount: number; // see note below
    }>;
};

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
    const { range } = computeRanges(period);

    const tz = "America/Toronto";

    let client;
    try {
        client = await pool.connect();
        const sql = `
  WITH
  series AS (
    SELECT generate_series(
      date_trunc('day', ($1::timestamptz AT TIME ZONE $3))::timestamptz,
      date_trunc('day', ($2::timestamptz AT TIME ZONE $3))::timestamptz,
      interval '1 day'
    ) AS day_start_local
  ),
  orders_in_range AS (
    SELECT
      o.id,
      o.created_at,
      COALESCE(o.sub_total::numeric, 0)::numeric AS amount,
      COALESCE(u.name, u.username, u.email, u.id::text) AS customer_name,
      date_trunc('day', (o.created_at AT TIME ZONE $3))::date AS day_local
    FROM "order" o
    LEFT JOIN "user" u ON u.id = o.user_id
    WHERE o.created_at >= $1::timestamptz
      AND o.created_at <  $2::timestamptz
  ),
  bucketed AS (
    SELECT
      date_trunc('day', (o.created_at AT TIME ZONE $3))::date AS day_local,
      COUNT(*)::bigint AS count,
      COALESCE(SUM(o.sub_total::numeric), 0)::numeric AS revenue
    FROM "order" o
    WHERE o.created_at >= $1::timestamptz
      AND o.created_at <  $2::timestamptz
    GROUP BY 1
  )
  SELECT
    (
      SELECT json_agg(json_build_object(
        'day', to_char(s.day_start_local::date, 'YYYY-MM-DD'),
        'count', COALESCE(b.count, 0),
        'revenue', COALESCE(b.revenue, 0)
      ) ORDER BY s.day_start_local)
      FROM series s
      LEFT JOIN bucketed b ON b.day_local = s.day_start_local::date
    ) AS buckets,
    (
      SELECT json_agg(json_build_object(
        'id', oir.id,
        'createdAt', oir.created_at,
        'customerName', oir.customer_name,
        'amount', oir.amount
      ) ORDER BY oir.created_at)
      FROM orders_in_range oir
    ) AS orders;
`;

        const params = [range.start, range.end, tz];

        const { rows } = await client.query(sql, params);
        const row = rows[0] ?? { buckets: [], orders: [] };

        const payload: OrdersTimeseriesResponse = {
            period,
            range,
            timezone: tz,
            buckets: (row.buckets ?? []) as OrdersTimeseriesResponse["buckets"],
            orders: (row.orders ?? []) as OrdersTimeseriesResponse["orders"],
        };

        return NextResponse.json(payload, {
            headers: { "Cache-Control": "private, max-age=30" },
        });
    } catch (err) {
        console.error("[/api/admin/orders-timeseries] error:", err);
        return NextResponse.json(
            { error: "Failed to fetch orders time-series" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
