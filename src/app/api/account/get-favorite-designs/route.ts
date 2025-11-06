import { getServerSideSession } from "@/hooks/use-session";
import { pool } from "@/lib/database/db";
import {
    FavoriteDesignRow,
    IFavoriteDesign,
} from "@/lib/types/user-favorite-designs.types";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { user } = await getServerSideSession();
        const userId = user?.id;
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
                    cd.id,
                    COALESCE(cd.image, gi.url) AS "imgSrc",
                    cd.cropped_image_url AS "croppedImgUrl",
                    cd.name AS "caseName",
                    pm.model_name AS "modelName",
                    cc.name AS "color",
                    cm.name AS "material",
                    cf.name AS "finish",
                    (cm.price + cf.price) AS "price",
                    cd.favorited_by_user_ids
                FROM case_design cd
                JOIN phone_model pm ON cd.phone_model_id = pm.id
                JOIN case_color cc ON cd.case_color_id = cc.id
                JOIN case_material cm ON cd.case_material_id = cm.id
                JOIN case_finish cf ON cd.case_finish_id = cf.id
                LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
                WHERE cd.favorited_by_user_ids @> ARRAY[$1]::text[]
                ORDER BY cd.created_at DESC
            `;

            const { rows } = await client.query<FavoriteDesignRow>(q, [userId]);

            const favoriteDesigns: IFavoriteDesign[] = rows.map((r) => ({
                id: r.id,
                imgSrc: r.imgSrc,
                croppedImgUrl: r.croppedImgUrl,
                caseName: r.caseName,
                modelName: r.modelName,
                color: r.color,
                material: r.material,
                finish: r.finish,
                price: Number(r.price),
                isFavorited: r.favorited_by_user_ids.includes(userId),
                totalFavorites: r.favorited_by_user_ids.length ?? 0,
            }));

            return NextResponse.json({ favoriteDesigns }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in get-favorite-designs-by-user-id:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
