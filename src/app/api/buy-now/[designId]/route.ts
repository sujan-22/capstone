import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { getServerSideSession } from "@/hooks/use-session";
import type { PoolClient } from "pg";

async function getActiveId(
    client: PoolClient,
    tableName: "phone_model" | "case_material" | "case_color" | "case_finish",
    originalId: string
): Promise<string> {
    const current = await client.query(
        `SELECT id FROM ${tableName} WHERE id = $1 AND active = TRUE LIMIT 1`,
        [originalId]
    );

    if (current.rowCount === 1) {
        return current.rows[0].id as string;
    }

    const fallback = await client.query(
        `SELECT id FROM ${tableName} WHERE active = TRUE ORDER BY id LIMIT 1`
    );

    if (fallback.rowCount === 0) {
        throw new Error(`No active records in ${tableName}`);
    }

    return fallback.rows[0].id as string;
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ designId: string }> }
) {
    const { designId } = await params;
    const { user } = await getServerSideSession();
    const userId = user?.id;

    if (!designId || !userId) {
        return NextResponse.json(
            { error: "Missing credentials" },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const fetchQuery = `
            SELECT
                phone_model_id,
                case_material_id,
                case_color_id,
                case_finish_id,
                width,
                height,
                name,
                image,
                gallery_image_id
            FROM case_design
            WHERE id = $1
            LIMIT 1;
        `;
        const res = await client.query(fetchQuery, [designId]);

        if (res.rowCount === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: "Design not found" },
                { status: 404 }
            );
        }

        const oldDesign = res.rows[0];

        // Ensure all FKs point to active records
        const phoneModelId = await getActiveId(
            client,
            "phone_model",
            oldDesign.phone_model_id
        );
        const caseMaterialId = await getActiveId(
            client,
            "case_material",
            oldDesign.case_material_id
        );
        const caseColorId = await getActiveId(
            client,
            "case_color",
            oldDesign.case_color_id
        );
        const caseFinishId = await getActiveId(
            client,
            "case_finish",
            oldDesign.case_finish_id
        );

        const insertQuery = `
            INSERT INTO case_design (
                user_id,
                phone_model_id,
                case_material_id,
                case_color_id,
                case_finish_id,
                width,
                height,
                name,
                image,
                gallery_image_id,
                unfinished
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
            RETURNING id;
        `;

        const insertValues = [
            userId,
            phoneModelId,
            caseMaterialId,
            caseColorId,
            caseFinishId,
            oldDesign.width,
            oldDesign.height,
            oldDesign.name,
            oldDesign.image,
            oldDesign.gallery_image_id,
        ];

        const insertRes = await client.query(insertQuery, insertValues);
        const newDesignId: string = insertRes.rows[0].id;

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Design duplicated successfully",
            newDesignId,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error duplicating design:", error);

        if (
            error instanceof Error &&
            error.message.startsWith("No active records")
        ) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        return NextResponse.json(
            { error: "Failed to duplicate design" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
