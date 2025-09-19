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

async function uploadFileToS3(fileBuffer: Buffer, fileName: string) {
    const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `users_image/${fileName}-${Date.now()}`,
        Body: fileBuffer,
        ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${params.Key}`;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "A file is required." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileUrl = await uploadFileToS3(buffer, file.name);

        return NextResponse.json({ success: true, fileUrl });
    } catch (error: unknown) {
        console.error("Error uploading file:", error);
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json(
            { error: "Failed to upload file.", details: errorMessage },
            { status: 500 }
        );
    }
}
