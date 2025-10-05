import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { IReminder, IReminderRow } from "@/lib/types/reminders.types";

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
                  r.id AS reminder_id,
                  r.user_id,
                  r.case_design_id,
                  r.status,
                  r.reminder_sent_count,
                  r.last_sent_at,
                  r.dismissed_at,
                  r.created_at,
                  r.updated_at,

                  cd.name AS case_name,
                  COALESCE(cd.image, gi.url) AS imgsrc,
                  cd.cropped_image_url,
                  pm.model_name AS modelname,
                  cc.name AS color,
                  cm.name AS material,
                  cf.name AS finish
                FROM reminders r
                JOIN case_design cd ON r.case_design_id = cd.id
                JOIN phone_model pm ON cd.phone_model_id = pm.id
                JOIN case_color cc ON cd.case_color_id = cc.id
                JOIN case_material cm ON cd.case_material_id = cm.id
                JOIN case_finish cf ON cd.case_finish_id = cf.id
                LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
                WHERE r.user_id = $1 AND r.status != 'dismissed' AND r.dismissed_at IS NULL AND cd.unfinished = true
                ORDER BY r.updated_at DESC
            `;

            const { rows } = await client.query<IReminderRow>(q, [userId]);

            const reminders: IReminder[] = rows.map((r) => ({
                id: String(r.reminder_id),
                userId: String(r.user_id),
                caseDesignId: String(r.case_design_id),
                status: r.status,
                croppedImgUrl: r.cropped_image_url ?? null,
                reminderSentCount: Number(r.reminder_sent_count ?? 0),
                lastSentAt: r.last_sent_at
                    ? new Date(r.last_sent_at).toISOString()
                    : null,
                dismissedAt: r.dismissed_at
                    ? new Date(r.dismissed_at).toISOString()
                    : null,
                createdAt: r.created_at
                    ? new Date(r.created_at).toISOString()
                    : "",
                updatedAt: r.updated_at
                    ? new Date(r.updated_at).toISOString()
                    : "",

                caseName: r.case_name,
                imgSrc: r.imgsrc ?? null,
                modelName: r.modelname,
                color: r.color,
                material: r.material,
                finish: r.finish,
            }));

            return NextResponse.json({ reminders }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in get-reminders:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
