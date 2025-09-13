// api/favorite/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";

interface FavoriteRequestBody {
    userId: string;
    caseDesignId: string;
}

export async function POST(req: Request) {
    const { userId, caseDesignId }: FavoriteRequestBody = await req.json();

    if (!userId || !caseDesignId) {
        return NextResponse.json(
            { error: "Missing userId or caseDesignId" },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        // Fetch current favorites
        const { rows } = await client.query<{
            favorited_by_user_ids: string[];
            total_favorites: number;
        }>(
            `SELECT favorited_by_user_ids, total_favorites
       FROM case_design
       WHERE id = $1`,
            [caseDesignId]
        );

        if (!rows.length) {
            return NextResponse.json(
                { error: "Case design not found" },
                { status: 404 }
            );
        }

        const { favorited_by_user_ids } = rows[0];

        let updatedFavorites: string[];
        let action: "added" | "removed";

        if (favorited_by_user_ids.includes(userId)) {
            updatedFavorites = favorited_by_user_ids.filter(
                (id) => id !== userId
            );
            action = "removed";
        } else {
            updatedFavorites = [...favorited_by_user_ids, userId];
            action = "added";
        }

        const totalFavorites = updatedFavorites.length;
        await client.query(
            `UPDATE case_design
       SET favorited_by_user_ids = $1,
           total_favorites = $2
       WHERE id = $3`,
            [updatedFavorites, totalFavorites, caseDesignId]
        );

        return NextResponse.json({ success: true, action, totalFavorites });
    } catch (error) {
        console.error("Error updating favorite:", error);
        return NextResponse.json(
            { error: "Failed to update favorite" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
