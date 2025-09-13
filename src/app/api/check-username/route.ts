import { usernameSchema } from "@/schema/username";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const username = url.searchParams.get("username");

        const parsed = usernameSchema.safeParse(username);
        if (!parsed.success) {
            return NextResponse.json({ available: 2 });
        }

        const res = await pool.query(
            'SELECT 1 FROM "user" WHERE username = $1',
            [parsed.data]
        );

        const available = res.rowCount === 0;
        return NextResponse.json(
            { available: available ? 1 : 0 },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error checking username:", err);
        return NextResponse.json(
            {
                available: 3,
                error: "Database error occured while checking username availability",
            },
            { status: 500 }
        );
    }
}
