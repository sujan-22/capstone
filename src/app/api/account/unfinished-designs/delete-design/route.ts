import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";

export interface DeleteDesignBody {
    designId: string;
}

export interface DeleteDesignResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { user } = await getServerSideSession();
        const userId = user?.id;
        if (!userId) {
            return NextResponse.json<DeleteDesignResponse>(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body: DeleteDesignBody = await req
            .json()
            .catch(() => ({} as DeleteDesignBody));
        const { designId } = body;

        if (!designId) {
            return NextResponse.json<DeleteDesignResponse>(
                { success: false, error: "designId is required" },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const { rowCount } = await client.query(
                `DELETE FROM case_design WHERE id = $1 AND user_id = $2`,
                [designId, userId]
            );

            if (rowCount === 0) {
                await client.query("ROLLBACK");
                return NextResponse.json<DeleteDesignResponse>(
                    {
                        success: false,
                        error: "Design not found or not owned by user",
                    },
                    { status: 404 }
                );
            }

            await client.query("COMMIT");

            return NextResponse.json<DeleteDesignResponse>(
                { success: true, message: "Design deleted successfully." },
                { status: 200 }
            );
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in delete-design:", err);
        return NextResponse.json<DeleteDesignResponse>(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
