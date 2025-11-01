import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { pool } from "@/lib/database/db";
import type { QueryResult } from "pg";

const {
    AWS_S3_REGION,
    AWS_S3_BUCKET_NAME,
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
} = process.env;

if (
    !AWS_S3_REGION ||
    !AWS_S3_BUCKET_NAME ||
    !AWS_S3_ACCESS_KEY_ID ||
    !AWS_S3_SECRET_ACCESS_KEY
) {
    throw new Error("Missing required AWS S3 environment variables");
}

const s3Client = new S3Client({
    region: AWS_S3_REGION,
    credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    },
});

/** Allowed mime types for upload */
const ALLOWED_MIME = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
]);

function getFileExtension(filename: string): string {
    const match = filename.match(/\.[^/.]+$/);
    return match ? match[0] : "";
}

async function uploadFileToS3(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    const ext = getFileExtension(fileName);
    const key = `users_image/${fileName.replace(
        /\s+/g,
        "_"
    )}-${Date.now()}${ext}`;
    const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURI(
        key
    )}`;
}

type PhoneModelRow = { id: string; model_name: string };
type GenericNamedRow = { id: string; name: string };
type InsertReturn = {
    id: string;
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const maybeFile = formData.get("file");

        if (!maybeFile || !(maybeFile instanceof File)) {
            return NextResponse.json(
                { error: "A file is required." },
                { status: 400 }
            );
        }
        const file: File = maybeFile;

        const contentType = file.type || "application/octet-stream";
        if (!ALLOWED_MIME.has(contentType)) {
            return NextResponse.json(
                {
                    error: "Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP.",
                },
                { status: 415 }
            );
        }

        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "Missing x-user-id header." },
                { status: 401 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let width: number | null = null;
        let height: number | null = null;
        try {
            const meta = await sharp(buffer).metadata();
            width = typeof meta.width === "number" ? meta.width : 500;
            height = typeof meta.height === "number" ? meta.height : 500;
        } catch (err) {
            width = 500;
            height = 500;
            console.warn("sharp metadata failed:", err);
        }

        // Upload to S3
        const fileUrl = await uploadFileToS3(buffer, file.name, contentType);

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const phoneRes: QueryResult<PhoneModelRow> = await client.query(
                `SELECT id, model_name FROM phone_model WHERE active = TRUE ORDER BY created_at LIMIT 1`
            );
            const materialRes: QueryResult<GenericNamedRow> =
                await client.query(
                    `SELECT id, name FROM case_material WHERE active = TRUE ORDER BY created_at LIMIT 1`
                );
            const colorRes: QueryResult<GenericNamedRow> = await client.query(
                `SELECT id, name FROM case_color WHERE active = TRUE ORDER BY created_at LIMIT 1`
            );
            const finishRes: QueryResult<GenericNamedRow> = await client.query(
                `SELECT id, name FROM case_finish WHERE active = TRUE ORDER BY created_at LIMIT 1`
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
          $11,$12,$13,NOW(),NOW(),NULL,$14,NULL,$15,$16
        )
        RETURNING id, width, height, image;
      `;

            const insertValues = [
                userId,
                phone.id,
                material.id,
                color.id,
                finish.id,
                designName,
                fileUrl,
                width,
                height,
                0, // total_saves
                0, // total_favorites
                false, // has_requested_to_share_publicly
                false, // is_shared_publicly
                true, // unfinished
                [], // saved_by_user_ids
                [], // favorited_by_user_ids
            ];

            const insertRes: QueryResult<InsertReturn> = await client.query(
                insertQuery,
                insertValues
            );

            await client.query("COMMIT");

            const inserted = insertRes.rows[0];
            const responsePayload: InsertReturn = {
                id: inserted.id,
            };

            return NextResponse.json(responsePayload, { status: 200 });
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
