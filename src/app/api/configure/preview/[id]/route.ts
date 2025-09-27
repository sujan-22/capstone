// api/configure/preview/[id]/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { ICaseDesign } from "@/lib/types/user-orders.types";

export interface IPreviewCaseDesign extends ICaseDesign {
    materialPrice: number;
    finishPrice: number;
    croppedImageUrl: string;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: designId } = await params;
    const userId = (req.headers.get("x-user-id") || "").trim();

    if (!designId || !userId) {
        return NextResponse.json(
            { error: "Missing credentials" },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        const query = `
      SELECT
        cd.id,
        COALESCE(cd.image, gi.url) AS "imgSrc",
        cd.name AS "caseName",
        cd.cropped_image_url AS "croppedImageUrl",
        pm.model_name AS "modelName",
        cc.name AS "color",
        cm.name AS "material",
        cm.price AS "materialPrice",
        cf.name AS "finish",
        cf.price AS "finishPrice",
        (cm.price + cf.price) AS "price"
      FROM case_design cd
      JOIN phone_model pm ON cd.phone_model_id = pm.id
      JOIN case_color cc ON cd.case_color_id = cc.id
      JOIN case_material cm ON cd.case_material_id = cm.id
      JOIN case_finish cf ON cd.case_finish_id = cf.id
      LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
      WHERE cd.id = $2 AND cd.user_id = $1
      LIMIT 1;
    `;

        const res = await client.query<IPreviewCaseDesign>(query, [
            userId,
            designId,
        ]);

        if (res.rowCount === 0) {
            return NextResponse.json(
                { error: "Design not found" },
                { status: 404 }
            );
        }

        const design = res.rows[0];

        return NextResponse.json({ designPreview: design, status: 200 });
    } catch (error) {
        console.error("Error fetching design preview:", error);
        return NextResponse.json(
            { error: "Failed to fetch design preview" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
