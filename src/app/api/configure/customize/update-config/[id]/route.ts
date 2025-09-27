// api/configure/customize/update-config/[id]/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";

interface UpdateBody {
    colorId?: string;
    materialId?: string;
    finishId?: string;
    modelId?: string;
}

interface UpdatedDesignRow {
    id: string;
    phone_model_id: string;
    case_color_id: string;
    case_material_id: string;
    case_finish_id: string;
}

interface CaseNameParts {
    model_name: string;
    color_name: string;
    material_name: string;
    finish_name: string;
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: designId } = await params;

    if (!designId) {
        return NextResponse.json(
            { error: "Missing design id" },
            { status: 400 }
        );
    }

    try {
        const body: UpdateBody = await req.json();

        if (
            !body.colorId &&
            !body.materialId &&
            !body.finishId &&
            !body.modelId
        ) {
            return NextResponse.json(
                { error: "No fields provided to update" },
                { status: 400 }
            );
        }

        const fields: string[] = [];
        const values: string[] = [];
        let index = 1;

        if (body.colorId) {
            fields.push(`case_color_id = $${index++}`);
            values.push(body.colorId);
        }
        if (body.materialId) {
            fields.push(`case_material_id = $${index++}`);
            values.push(body.materialId);
        }
        if (body.finishId) {
            fields.push(`case_finish_id = $${index++}`);
            values.push(body.finishId);
        }
        if (body.modelId) {
            fields.push(`phone_model_id = $${index++}`);
            values.push(body.modelId);
        }

        values.push(designId);

        const client = await pool.connect();

        try {
            const updateQuery = `
              UPDATE case_design
              SET ${fields.join(", ")}, updated_at = NOW()
              WHERE id = $${index}
              RETURNING id, phone_model_id, case_color_id, case_material_id, case_finish_id;
            `;
            const result = await client.query<UpdatedDesignRow>(
                updateQuery,
                values
            );

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: "Design not found" },
                    { status: 404 }
                );
            }

            const {
                phone_model_id,
                case_color_id,
                case_material_id,
                case_finish_id,
            } = result.rows[0];

            const nameQuery = `
              SELECT 
                pm.model_name,
                cc.name AS color_name,
                cm.name AS material_name,
                cf.name AS finish_name
              FROM phone_model pm
              JOIN case_color cc ON cc.id = $1
              JOIN case_material cm ON cm.id = $2
              JOIN case_finish cf ON cf.id = $3
              WHERE pm.id = $4
              LIMIT 1;
            `;
            const nameResult = await client.query<CaseNameParts>(nameQuery, [
                case_color_id,
                case_material_id,
                case_finish_id,
                phone_model_id,
            ]);

            if ((nameResult.rowCount ?? 0) > 0) {
                const { model_name, color_name, material_name, finish_name } =
                    nameResult.rows[0];

                const caseName = `${model_name} - ${color_name} ${finish_name} ${material_name}`;

                await client.query(
                    `UPDATE case_design SET name = $1, updated_at = NOW() WHERE id = $2`,
                    [caseName, designId]
                );
            }

            return NextResponse.json({
                success: true,
                message: "Case design saved successfully",
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("DB error:", error);
        return NextResponse.json(
            { error: "Failed to update design" },
            { status: 500 }
        );
    }
}
