import { ICaseDesignProps } from "@/components/case-design/case-design";
import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const client = await pool.connect();

    try {
        const userId = req.headers.get("x-user-id") || "";
        const url = new URL(req.url);
        const sort = url.searchParams.get("sort") || "none";
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        let orderBy = "cd.total_favorites DESC";

        if (sort === "price_low_to_high") orderBy = "cm.price + cf.price ASC";
        else if (sort === "price_high_to_low")
            orderBy = "cm.price + cf.price DESC";

        let query = `
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
                cd.favorited_by_user_ids @> ARRAY[$1]::text[] AS "isFavorited",
                array_length(cd.favorited_by_user_ids, 1) AS "totalFavorites"
            FROM case_design cd
            JOIN phone_model pm ON cd.phone_model_id = pm.id
            JOIN case_color cc ON cd.case_color_id = cc.id
            JOIN case_material cm ON cd.case_material_id = cm.id
            JOIN case_finish cf ON cd.case_finish_id = cf.id
            LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
            WHERE cd.is_shared_publicly = TRUE
            ORDER BY ${orderBy}
        `;

        if (limit) {
            query += ` LIMIT ${limit}`;
        }

        const res = await client.query<ICaseDesignProps>(query, [userId]);
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error("Error fetching featured designs:", error);
        return NextResponse.json(
            { error: "Failed to fetch featured designs" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
