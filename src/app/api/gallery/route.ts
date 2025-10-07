import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
    limit: z.string().optional().default("20"),
    offset: z.string().optional().default("0"),
    sort: z
        .enum(["none", "popularity_asc", "popularity_desc"])
        .optional()
        .default("none"),
});

export interface GalleryImage {
    id: string;
    url: string;
    created_at: string;
    usage_count?: number;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parsed = querySchema.safeParse({
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
            sort: searchParams.get("sort") as
                | "none"
                | "popularity_asc"
                | "popularity_desc"
                | null,
        });

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid query parameters",
                    details: parsed.error.format(),
                },
                { status: 400 }
            );
        }

        const limit = parseInt(parsed.data.limit, 10);
        const offset = parseInt(parsed.data.offset, 10);
        const sort = parsed.data.sort;

        let orderBy = "gi.created_at DESC";
        if (sort === "popularity_desc") {
            orderBy = "COALESCE(cd.usage_count, 0) DESC, gi.created_at DESC";
        } else if (sort === "popularity_asc") {
            orderBy = "COALESCE(cd.usage_count, 0) ASC, gi.created_at DESC";
        }

        const client = await pool.connect();

        const sql = `
            SELECT gi.id, gi.url, gi.created_at, COALESCE(cd.usage_count, 0) AS usage_count
            FROM gallery_image gi
            LEFT JOIN (
                SELECT gallery_image_id, COUNT(*) AS usage_count
                FROM case_design
                WHERE gallery_image_id IS NOT NULL
                GROUP BY gallery_image_id
            ) cd ON cd.gallery_image_id = gi.id
            ORDER BY ${orderBy}
            LIMIT $1 OFFSET $2
        `;

        const result = await client.query<GalleryImage>(sql, [limit, offset]);

        client.release();

        return NextResponse.json({
            images: result.rows,
            pagination: {
                limit,
                offset,
                count: result.rowCount,
            },
        });
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return NextResponse.json(
            { error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}
