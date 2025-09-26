import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

const ALLOWED_MIME = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
]);

function extractS3KeyFromUrl(url: string): string {
    const match = url.match(/amazonaws\.com\/(.+)$/);
    if (!match || !match[1]) {
        throw new Error("Could not extract S3 key from URL");
    }
    return decodeURIComponent(match[1]);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const maybeFile = formData.get("file");
        const imageUrl = formData.get("imageUrl");

        if (!maybeFile || !(maybeFile instanceof File)) {
            return NextResponse.json(
                { error: "A file is required." },
                { status: 400 }
            );
        }
        if (!imageUrl || typeof imageUrl !== "string") {
            return NextResponse.json(
                { error: "An existing imageUrl is required." },
                { status: 400 }
            );
        }

        const file: File = maybeFile;

        const contentType = file.type || "application/octet-stream";
        if (!ALLOWED_MIME.has(contentType)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: PNG, JPG, JPEG, WEBP." },
                { status: 415 }
            );
        }

        const key = extractS3KeyFromUrl(imageUrl);

        const buffer = Buffer.from(await file.arrayBuffer());
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });
        await s3Client.send(command);

        return NextResponse.json({
            success: true,
            fileUrl: imageUrl,
            message: "Image replaced successfully",
        });
    } catch (error: unknown) {
        console.error("Error updating file:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to update image", details: message },
            { status: 500 }
        );
    }
}
