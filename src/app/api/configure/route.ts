export const runtime = "nodejs";

import { generateOrderConfirmationEmailHTML } from "@/components/utilities/order-confirmation-email";
import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/utils";
import { sendEmail } from "../../../../actions/email";

export async function POST() {
    try {
        const userEmail = "designmycase.app@gmail.com";
        if (!userEmail) {
            throw new Error("Missing user email");
        }

        const orderId = "d1aff7ab-36db-4fd7-8ab9-009e19f0cb5e";
        const caseDesignId = "449a1932-c6ac-474f-a33e-34c75309d01d";

        if (!orderId || !caseDesignId) {
            throw new Error("Missing metadata");
        }

        const client = await pool.connect();

        let orderRow = null;

        try {
            await client.query("BEGIN");

            const orderRes = await client.query(
                `
                    SELECT
                        o.id,
                        o.order_number,
                        o.created_at,
                        o.sub_total,
                        o.tax,
                        o.total_amount,
                        d.id            AS case_design_id,
                        d.name          AS design_name,
                        d.cropped_image_url         AS design_image,
                        pm.model_name         AS phone_model_name,
                        cm.name         AS material_name,
                        cf.name         AS finish_name,
                        cc.name         AS color_name
                    FROM "order" o
                    JOIN case_design   d  ON d.id  = o.case_design_id
                    JOIN phone_model   pm ON pm.id = d.phone_model_id
                    JOIN case_material cm ON cm.id = d.case_material_id
                    JOIN case_finish   cf ON cf.id = d.case_finish_id
                    JOIN case_color    cc ON cc.id = d.case_color_id
                    WHERE o.id = $1
                    LIMIT 1
                    `,
                [orderId]
            );

            if (!orderRes.rowCount) {
                throw new Error("Order not found after update");
            }

            orderRow = orderRes.rows[0];

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }

        if (orderRow) {
            const orderForEmail = {
                orderId: String(orderRow.id),
                orderNumber: String(orderRow.order_number),
                createdAt: new Date(orderRow.created_at).toLocaleString(),
                items: [
                    {
                        id: String(orderRow.case_design_id),
                        name: orderRow.design_name as string,
                        image: (orderRow.design_image as string) ?? null,
                        model: orderRow.phone_model_name as string,
                        material: orderRow.material_name as string,
                        finish: orderRow.finish_name as string,
                        color: orderRow.color_name as string,
                        price: formatPrice(Number(orderRow.total_amount)),
                    },
                ],
                subtotal: formatPrice(Number(orderRow.sub_total)),
                tax: formatPrice(Number(orderRow.tax)),
                total: formatPrice(Number(orderRow.total_amount)),
            };

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
            const html = generateOrderConfirmationEmailHTML(
                orderForEmail,
                baseUrl
            );
            const subject = `Order confirmation – ${orderForEmail.orderNumber}`;

            try {
                const sendRes = await sendEmail({
                    to: userEmail,
                    subject,
                    text: "",
                    html,
                });

                if (!sendRes || !sendRes.success) {
                    throw new Error(sendRes?.message ?? "sendEmail failed");
                }
            } catch (err) {
                console.error("Failed to send order confirmation email", err);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                message: "something went wrong",
                ok: false,
            },
            {
                status: 500,
            }
        );
    }
}
