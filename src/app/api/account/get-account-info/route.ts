import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { IUserInfo, UserInfoRow } from "@/lib/types/user-info.types";

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const client = await pool.connect();
        try {
            const q = `
                SELECT
                  $1::text AS user_id,
                  (SELECT COUNT(*) FROM "order" o WHERE o.user_id = $1) AS total_orders,
                  (SELECT COUNT(*) FROM case_design cd WHERE cd.favorited_by_user_ids @> ARRAY[$1]::text[]) AS favorite_designs_count
            `;

            const { rows } = await client.query<UserInfoRow>(q, [userId]);

            const row = rows[0];
            const userInfo: IUserInfo = {
                userId: row.user_id,
                totalOrders: Number(row.total_orders),
                favoriteDesignsCount: Number(row.favorite_designs_count),
            };

            return NextResponse.json({ user: userInfo }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in get-user-info:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
