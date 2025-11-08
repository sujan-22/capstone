import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "@/lib/database/db";
import type { QueryResult } from "pg";
import { getServerSideSession } from "@/hooks/use-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const key = `gallery_image/${fileName.replace(
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

        const { user } = await getServerSideSession();
        const userId = user?.id;
        if (!userId || user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3
        const fileUrl = await uploadFileToS3(buffer, file.name, contentType);

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const insertQuery = `
        INSERT INTO gallery_image (
          url, created_at, updated_at
        ) VALUES (
          $1, NOW(), NOW()
        )
        RETURNING id
      `;

            const insertValues = [fileUrl];

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
