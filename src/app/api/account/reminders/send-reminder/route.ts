// app/api/reminders/send-reminder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { sendEmail } from "../../../../../../actions/email";
import { generateReminderEmailHTML } from "@/components/utilities/email-template";

const BATCH_SIZE = Number(process.env.REMINDER_BATCH_SIZE ?? 50);
const RATE_PER_SECOND = Number(process.env.REMINDER_RATE_PER_SECOND ?? 5);
const DELAY_MS = Math.ceil(1000 / Math.max(1, RATE_PER_SECOND));
const DUE_INTERVAL_HOURS = Number(process.env.REMINDER_DUE_HOURS ?? 24);

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const client = await pool.connect();
    let totalSentEmails = 0;
    let totalCreatedReminders = 0;
    let totalSkipped = 0;
    const errors: Array<{
        userId?: string;
        designId?: string;
        reason: string;
    }> = [];

    try {
        let offset = 0;
        const intervalText = `${DUE_INTERVAL_HOURS} hours`;

        while (true) {
            const q = `
        SELECT
          cd.id,
          cd.user_id,
          cd.name,
          COALESCE(cd.image, gi.url) AS image,
          cd.created_at,
          cd.last_reminder_sent_at,
          u.email AS user_email
        FROM case_design cd
        JOIN "user" u ON cd.user_id = u.id
        LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id

        LEFT JOIN LATERAL (
          SELECT 1 FROM reminders r2
          WHERE r2.case_design_id = cd.id
            AND r2.user_id = cd.user_id
          LIMIT 1
        ) existing_reminder ON TRUE

        WHERE cd.unfinished = true
          AND existing_reminder IS NULL
          AND (
            (cd.last_reminder_sent_at IS NOT NULL AND cd.last_reminder_sent_at <= now() - ($1::interval))
            OR
            (cd.last_reminder_sent_at IS NULL AND cd.created_at <= now() - ($1::interval))
          )
        ORDER BY cd.created_at ASC
        LIMIT $2 OFFSET $3
      `;

            const { rows } = await client.query<{
                id: string;
                user_id: string;
                name: string;
                image: string | null;
                created_at: string;
                last_reminder_sent_at: string | null;
                user_email: string | null;
            }>(q, [intervalText, BATCH_SIZE, offset]);

            if (!rows.length) break;

            const groups = new Map<
                string,
                {
                    user_email: string | null;
                    designs: {
                        id: string;
                        name: string;
                        image: string | null;
                        created_at: string;
                        last_reminder_sent_at: string | null;
                    }[];
                }
            >();

            for (const r of rows) {
                const grp = groups.get(r.user_id) ?? {
                    user_email: r.user_email,
                    designs: [],
                };
                grp.designs.push({
                    id: r.id,
                    name: r.name,
                    image: r.image,
                    created_at: r.created_at,
                    last_reminder_sent_at: r.last_reminder_sent_at,
                });
                groups.set(r.user_id, grp);
            }

            for (const [userId, { user_email, designs }] of groups.entries()) {
                if (!user_email) {
                    totalSkipped += designs.length;
                    for (const d of designs) {
                        errors.push({
                            userId,
                            designId: d.id,
                            reason: "missing user email",
                        });
                    }
                    continue;
                }

                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
                const html = generateReminderEmailHTML(designs, baseUrl);
                const subject =
                    designs.length === 1
                        ? `Reminder: Continue your design "${designs[0].name}"`
                        : `Reminder: You have ${designs.length} unfinished designs`;

                let sendOk = false;
                try {
                    const sendRes = await sendEmail({
                        to: user_email,
                        subject,
                        text: "",
                        html,
                    });
                    if (!sendRes || !sendRes.success) {
                        throw new Error(sendRes?.message ?? "sendEmail failed");
                    }
                    sendOk = true;
                    totalSentEmails++;
                } catch (err) {
                    const reason =
                        typeof err === "object" &&
                        err !== null &&
                        "message" in err
                            ? (err as { message: string }).message ||
                              String(err)
                            : String(err);
                    errors.push({
                        userId,
                        reason: `email send failed: ${reason}`,
                    });
                    totalSkipped += designs.length;
                    await sleep(DELAY_MS);
                    continue;
                }

                if (sendOk) {
                    const tx = await pool.connect();
                    try {
                        await tx.query("BEGIN");

                        const insertReminderQ = `
              INSERT INTO reminders
                (user_id, case_design_id, status, reminder_sent_count, last_sent_at, created_at, updated_at)
              VALUES ($1, $2, 'sent', 1, now(), now(), now())
              RETURNING id
            `;

                        const updateDesignQ = `
              UPDATE case_design
              SET last_reminder_sent_at = now(), updated_at = now()
              WHERE id = $1
            `;

                        for (const d of designs) {
                            await tx.query(insertReminderQ, [userId, d.id]);
                            await tx.query(updateDesignQ, [d.id]);
                            totalCreatedReminders++;
                        }

                        await tx.query("COMMIT");
                    } catch (err) {
                        try {
                            await tx.query("ROLLBACK");
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (_) {}
                        const reason =
                            typeof err === "object" &&
                            err !== null &&
                            "message" in err
                                ? (err as { message: string }).message ||
                                  String(err)
                                : String(err);
                        errors.push({
                            userId,
                            reason: `db insert failed: ${reason}`,
                        });
                    } finally {
                        tx.release();
                    }
                }
                await sleep(DELAY_MS);
            }
            offset += BATCH_SIZE;
        }

        return NextResponse.json(
            {
                success: true,
                totalSentEmails,
                totalCreatedReminders,
                totalSkipped,
                errors,
                message: "Cron Job Ran" + new Date(),
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error in send-reminders cron:", err);
        return NextResponse.json(
            { error: "Internal server error", details: String(err) },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
