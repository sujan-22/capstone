import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";

interface FavoriteRequestBody {
    caseDesignId: string;
}

export async function POST(req: Request) {
    const { caseDesignId }: FavoriteRequestBody = await req.json();
    const { user } = await getServerSideSession();
    const userId = user?.id;

    if (!userId || !caseDesignId) {
        return NextResponse.json(
            { error: "Missing userId or caseDesignId" },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        const q = `
  UPDATE case_design
  SET favorited_by_user_ids = 
    CASE 
      WHEN $2 = ANY(favorited_by_user_ids) THEN array_remove(favorited_by_user_ids, $2)
      ELSE array_append(favorited_by_user_ids, $2)
    END,
    total_favorites = COALESCE(array_length(
      CASE 
        WHEN $2 = ANY(favorited_by_user_ids) THEN array_remove(favorited_by_user_ids, $2)
        ELSE array_append(favorited_by_user_ids, $2)
      END, 1
    ), 0)
  WHERE id = $1
  RETURNING favorited_by_user_ids, total_favorites;
`;

        const { rows } = await client.query<{
            favorited_by_user_ids: string[];
            total_favorites: number;
        }>(q, [caseDesignId, userId]);

        if (!rows.length) {
            return NextResponse.json(
                { error: "Case design not found" },
                { status: 404 }
            );
        }

        const updatedFavorites = rows[0].favorited_by_user_ids;
        const totalFavorites = rows[0].total_favorites;
        const action: "added" | "removed" = updatedFavorites.includes(userId)
            ? "added"
            : "removed";

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
