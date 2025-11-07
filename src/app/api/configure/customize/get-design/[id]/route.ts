import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";

interface CaseDesignRow {
    width: number;
    height: number;
    image: string | null;
    phone_model_id: string;
    case_material_id: string;
    case_finish_id: string;
    case_color_id: string;
    cropped_image_url: string | null;
    has_order: boolean;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: designId } = await params;
    const { user } = await getServerSideSession();
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }
    if (!designId) {
        return NextResponse.json(
            { error: "Missing design id" },
            { status: 400 }
        );
    }

    try {
        const client = await pool.connect();
        try {
            const query = `
        SELECT 
          cd.width,
          cd.height,
          COALESCE(cd.image, gi.url) AS image,
          cd.phone_model_id,
          cd.case_material_id,
          cd.case_finish_id,
          cd.case_color_id,
          cd.cropped_image_url,
          EXISTS (
            SELECT 1
            FROM "order" o
            WHERE o.case_design_id = cd.id
          ) AS has_order
        FROM case_design cd
        LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
        WHERE cd.id = $1
          AND cd.user_id = $2          
        LIMIT 1;
      `;

            const result = await client.query<CaseDesignRow>(query, [
                designId,
                userId,
            ]);

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: "Design not found" },
                    { status: 404 }
                );
            }

            const design = result.rows[0];

            if (design.has_order) {
                return NextResponse.json({
                    error: "This design is already associated with an order",
                });
            }

            const response = {
                width: design.width,
                height: design.height,
                imageUrl: design.image,
                phoneModelId: design.phone_model_id,
                caseMaterialId: design.case_material_id,
                caseFinishId: design.case_finish_id,
                caseColorId: design.case_color_id,
                croppedImageUrl: design.cropped_image_url,
            };

            return NextResponse.json({ design: response });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("DB error:", error);
        return NextResponse.json(
            { error: "Failed to fetch design" },
            { status: 500 }
        );
    }
}
