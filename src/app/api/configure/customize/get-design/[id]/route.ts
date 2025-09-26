import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";

interface CaseDesignRow {
    width: number;
    height: number;
    image: string | null;
    phone_model_id: string;
    case_material_id: string;
    case_finish_id: string;
    case_color_id: string;
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const designId = params.id;

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
          width,
          height,
          image,
          phone_model_id,
          case_material_id,
          case_finish_id,
          case_color_id
        FROM case_design
        WHERE id = $1
        LIMIT 1;
      `;

            const result = await client.query<CaseDesignRow>(query, [designId]);

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: "Design not found" },
                    { status: 404 }
                );
            }

            const design = result.rows[0];

            const response: {
                width: number;
                height: number;
                imageUrl: string | null;
                phoneModelId: string;
                caseMaterialId: string;
                caseFinishId: string;
                caseColorId: string;
            } = {
                width: design.width,
                height: design.height,
                imageUrl: design.image,
                phoneModelId: design.phone_model_id,
                caseMaterialId: design.case_material_id,
                caseFinishId: design.case_finish_id,
                caseColorId: design.case_color_id,
            };

            return NextResponse.json(response);
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
