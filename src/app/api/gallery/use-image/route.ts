import { NextResponse } from "next/server";
import sharp from "sharp";
import { pool } from "@/lib/database/db";
import type { QueryResult } from "pg";
import { getServerSideSession } from "@/hooks/use-session";

type PhoneModelRow = { id: string; model_name: string };
type GenericNamedRow = { id: string; name: string };
type InsertReturn = { id: string };

export async function POST(request: Request) {
    try {
        const { user } = await getServerSideSession();
        const userId = user?.id;
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { error: "Invalid or missing JSON body." },
                { status: 400 }
            );
        }

        const { imageUrl, gallery_image_id } = body as {
            imageUrl?: string | null;
            gallery_image_id?: number | string | null;
        };

        if (
            gallery_image_id === undefined ||
            gallery_image_id === null ||
            gallery_image_id === ""
        ) {
            return NextResponse.json(
                { error: "Missing gallery_image_id in request body." },
                { status: 400 }
            );
        }

        let width: number = 500;
        let height: number = 500;

        if (typeof imageUrl === "string" && imageUrl.length > 0) {
            try {
                const res = await fetch(imageUrl);
                if (!res.ok) {
                    console.warn(
                        "Failed to fetch image URL:",
                        res.status,
                        res.statusText
                    );
                } else {
                    const arrayBuffer = await res.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const meta = await sharp(buffer).metadata();
                    if (typeof meta.width === "number") width = meta.width;
                    if (typeof meta.height === "number") height = meta.height;
                }
            } catch (err) {
                console.warn(
                    "Error fetching or reading image metadata, falling back to defaults:",
                    err
                );
            }
        } else {
            console.warn(
                "No imageUrl provided — using default dimensions 500x500"
            );
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const phoneRes: QueryResult<PhoneModelRow> = await client.query(
                `SELECT id, model_name FROM phone_model ORDER BY created_at LIMIT 1`
            );
            const materialRes: QueryResult<GenericNamedRow> =
                await client.query(
                    `SELECT id, name FROM case_material ORDER BY created_at LIMIT 1`
                );
            const colorRes: QueryResult<GenericNamedRow> = await client.query(
                `SELECT id, name FROM case_color ORDER BY created_at LIMIT 1`
            );
            const finishRes: QueryResult<GenericNamedRow> = await client.query(
                `SELECT id, name FROM case_finish ORDER BY created_at LIMIT 1`
            );

            if (
                phoneRes.rowCount === 0 ||
                materialRes.rowCount === 0 ||
                colorRes.rowCount === 0 ||
                finishRes.rowCount === 0
            ) {
                await client.query("ROLLBACK");
                return NextResponse.json(
                    {
                        error: "One or more reference tables are empty. Need at least one phone_model, case_material, case_color, and case_finish.",
                    },
                    { status: 500 }
                );
            }

            const phone = phoneRes.rows[0];
            const material = materialRes.rows[0];
            const color = colorRes.rows[0];
            const finish = finishRes.rows[0];

            const designName = `${phone.model_name} - ${color.name} ${finish.name} ${material.name}`;
            const insertQuery = `
                INSERT INTO case_design (
                    user_id,
                    phone_model_id,
                    case_material_id,
                    case_color_id,
                    case_finish_id,
                    name,
                    image,
                    width,
                    height,
                    total_saves,
                    total_favorites,
                    has_requested_to_share_publicly,
                    is_shared_publicly,
                    created_at,
                    updated_at,
                    last_reminder_sent_at,
                    unfinished,
                    gallery_image_id,
                    saved_by_user_ids,
                    favorited_by_user_ids
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                    $11,$12,$13,NOW(),NOW(),NULL,$14,$15,$16,$17
                )
                RETURNING id;
            `;

            const insertValues = [
                userId,
                phone.id,
                material.id,
                color.id,
                finish.id,
                designName,
                null,
                width,
                height,
                0,
                0,
                false,
                false,
                true,
                gallery_image_id,
                [],
                [],
            ];

            const insertRes: QueryResult<InsertReturn> = await client.query(
                insertQuery,
                insertValues
            );

            await client.query("COMMIT");

            const inserted = insertRes.rows[0];
            return NextResponse.json({ id: inserted.id }, { status: 200 });
        } catch (dbErr) {
            await client.query("ROLLBACK");
            console.error("DB Error:", dbErr);
            return NextResponse.json(
                { error: "DB operation failed", details: String(dbErr) },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error: unknown) {
        console.error("Error uploading file:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to upload file.", details: message },
            { status: 500 }
        );
    }
}
