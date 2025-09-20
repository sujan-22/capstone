import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";

type Body = {
    reminderId: string;
};

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body: Body = await req.json().catch(() => ({} as Body));
        const { reminderId } = body;

        if (!reminderId) {
            return NextResponse.json(
                { error: "reminderId is required" },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            const q = `
                UPDATE reminders
                SET 
                    status = 'dismissed',
                    dismissed_at = now(),
                    updated_at = now()
                WHERE id = $1 AND user_id = $2
            `;

            const result = await client.query(q, [reminderId, userId]);

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: "Reminder not found or not owned by user" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, message: "Reminder dismissed successfully." },
                { status: 200 }
            );
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in dismiss-reminder:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
