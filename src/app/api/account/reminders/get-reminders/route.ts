import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { IReminder, ReminderRow } from "@/lib/types/reminders.types";

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
          cd.user_id,
          cd.name AS case_name,
          COALESCE(cd.image, gi.url) AS imgsrc,
          pm.model_name AS modelname,
          cc.name AS color,
          cm.name AS material,
          cf.name AS finish,
          cd.last_reminder_sent_at,
          cd.reminder_count,
          cd.createdat,
          cd.has_dismissed,
          (COALESCE(cd.last_reminder_sent_at, cd.createdat) + (COALESCE(cd.remind_after_days, 1) * INTERVAL '1 day')) AS next_reminder_at
        FROM case_design cd
        JOIN phone_model pm ON cd.phone_model_id = pm.id
        JOIN case_color cc ON cd.case_color_id = cc.id
        JOIN case_material cm ON cd.case_material_id = cm.id
        JOIN case_finish cf ON cd.case_finish_id = cf.id
        LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
        WHERE
          cd.user_id = $1
          AND cd.unfinished = true
          AND cd.has_dismissed = false
          AND (COALESCE(cd.last_reminder_sent_at, cd.createdat) + (COALESCE(cd.remind_after_days, 1) * INTERVAL '1 day')) <= now()
          AND cd.reminder_count > 0
          AND cd.reminder_count < 4
        ORDER BY last_reminder_sent_at DESC
      `;

            const { rows } = await client.query<ReminderRow>(q, [userId]);

            const reminders: IReminder[] = rows.map((r) => ({
                id: String(r.id),
                userId: String(r.user_id),
                caseName: String(r.case_name),
                imgSrc: r.imgsrc ?? null,
                modelName: String(r.modelname),
                color: String(r.color),
                material: String(r.material),
                finish: String(r.finish),
                hasDismissed: r.has_dismissed,
                lastReminderSentAt: r.last_reminder_sent_at
                    ? new Date(r.last_reminder_sent_at).toISOString()
                    : null,
                reminderCount: Number(r.reminder_count ?? 0),
                createdAt: r.createdat
                    ? new Date(r.createdat).toISOString()
                    : "",
                nextReminderAt: r.next_reminder_at
                    ? new Date(r.next_reminder_at).toISOString()
                    : null,
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
