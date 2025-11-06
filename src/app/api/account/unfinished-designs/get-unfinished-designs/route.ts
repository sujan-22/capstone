import { getServerSideSession } from "@/hooks/use-session";
import { pool } from "@/lib/database/db";
import {
    IUnfinishedDesign,
    UnfinishedDesignRow,
} from "@/lib/types/unfinished-designs.types";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { user } = await getServerSideSession();
        const userId = user?.id;
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
          cd.cropped_image_url,
          cd.name AS case_name,
          pm.model_name AS modelname,
          cc.name AS color,
          cm.name AS material,
          cf.name AS finish,
          cd.created_at,
          cd.updated_at,

          -- reminder (for this user & this design, if exists)
          r.id AS reminder_id,
          r.status AS reminder_status,
          r.reminder_sent_count,
          r.last_sent_at,
          r.dismissed_at

        FROM case_design cd
        JOIN phone_model pm ON cd.phone_model_id = pm.id
        JOIN case_color cc ON cd.case_color_id = cc.id
        JOIN case_material cm ON cd.case_material_id = cm.id
        JOIN case_finish cf ON cd.case_finish_id = cf.id
        LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id

        /* join reminder row for this user (if any) */
        LEFT JOIN reminders r
          ON r.case_design_id = cd.id
          AND r.user_id = $1

        WHERE cd.user_id = $1
          AND cd.unfinished = true

        ORDER BY cd.created_at DESC
      `;

            const { rows } = await client.query<UnfinishedDesignRow>(q, [
                userId,
            ]);

            const unfinishedDesigns: IUnfinishedDesign[] = rows.map((r) => {
                const reminderCount = Number(r.reminder_sent_count ?? 0);
                const status = r.reminder_status ?? null;
                const hasDismissed =
                    status === "dismissed" ||
                    status === "skipped" ||
                    status === "opted_out";

                return {
                    id: r.id,
                    imgSrc: r.imgsrc,
                    croppedImgUrl: r.cropped_image_url ?? null,
                    caseName: r.case_name,
                    modelName: r.modelname,
                    color: r.color,
                    material: r.material,
                    finish: r.finish,
                    createdAt: r.created_at
                        ? new Date(r.created_at).toISOString()
                        : "",
                    updatedAt: r.updated_at
                        ? new Date(r.updated_at).toISOString()
                        : "",
                    reminderCount,
                    lastReminderSentAt: r.last_sent_at
                        ? new Date(r.last_sent_at).toISOString()
                        : null,
                    hasDismissed,
                };
            });

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
