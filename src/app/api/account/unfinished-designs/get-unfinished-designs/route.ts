import { pool } from "@/lib/database/db";
import {
    IUnfinishedDesign,
    UnfinishedDesignRow,
} from "@/lib/types/unfinished-designs.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const client = await pool.connect();
        try {
            const q = `
                SELECT
                    cd.id,
                    COALESCE(cd.image, gi.url) AS imgsrc,
                    cd.name AS case_name,
                    pm.model_name AS modelname,
                    cc.name AS color,
                    cm.name AS material,
                    cf.name AS finish,
                    cd.createdat,
                    cd.updatedat,
                    cd.reminder_count,
                    cd.last_reminder_sent_at,
                    cd.has_dismissed
                FROM case_design cd
                JOIN phone_model pm ON cd.phone_model_id = pm.id
                JOIN case_color cc ON cd.case_color_id = cc.id
                JOIN case_material cm ON cd.case_material_id = cm.id
                JOIN case_finish cf ON cd.case_finish_id = cf.id
                LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
                WHERE cd.user_id = $1
                  AND cd.unfinished = true
                ORDER BY cd.createdat DESC
            `;

            const { rows } = await client.query<UnfinishedDesignRow>(q, [
                userId,
            ]);

            const unfinishedDesigns: IUnfinishedDesign[] = rows.map((r) => ({
                id: r.id,
                imgSrc: r.imgsrc,
                caseName: r.case_name,
                modelName: r.modelname,
                color: r.color,
                material: r.material,
                finish: r.finish,
                createdAt: new Date(r.createdat).toISOString(),
                updatedAt: new Date(r.updatedat).toISOString(),
                reminderCount: r.reminder_count,
                lastReminderSentAt: r.last_reminder_sent_at
                    ? new Date(r.last_reminder_sent_at).toISOString()
                    : null,
                hasDismissed: r.has_dismissed,
            }));

            return NextResponse.json({ unfinishedDesigns }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in get-unfinished-designs:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
