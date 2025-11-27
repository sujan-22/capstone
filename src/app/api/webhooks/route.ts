export const runtime = "nodejs";

import { generateOrderConfirmationEmailHTML } from "@/components/utilities/order-confirmation-email";
import { pool } from "@/lib/database/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { formatPrice } from "@/lib/utils";
import { sendEmail } from "../../../../actions/email";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = (await headers()).get("stripe-signature");

        if (!signature) {
            return new Response("Invalid signature", { status: 400 });
        }

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const userEmail = session.customer_details?.email;
            if (!userEmail) {
                throw new Error("Missing user email");
            }

            const { userId, orderId, caseDesignId } = session.metadata || {
                userId: null,
                orderId: null,
                caseDesignId: null,
            };

            if (!userId || !orderId || !caseDesignId) {
                throw new Error("Missing metadata");
            }

            const billingAddress = session.customer_details!.address;
            const shippingAddress = session.customer_details!.address;

            const client = await pool.connect();

            let orderRow = null;

            try {
                await client.query("BEGIN");

                const billingRes = await client.query(
                    `INSERT INTO billing_address (name, street, city, postal_code, country, state)
                     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
                    [
                        session.customer_details!.name,
                        billingAddress?.line1,
                        billingAddress?.city,
                        billingAddress?.postal_code,
                        billingAddress?.country,
                        billingAddress?.state,
                    ]
                );

                const shippingRes = await client.query(
                    `INSERT INTO shipping_address (name, street, city, postal_code, country, state)
                     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
                    [
                        session.customer_details!.name,
                        shippingAddress?.line1,
                        shippingAddress?.city,
                        shippingAddress?.postal_code,
                        shippingAddress?.country,
                        shippingAddress?.state,
                    ]
                );

                await client.query(
                    `UPDATE "order"
                     SET billing_address_id = $1,
                         shipping_address_id = $2,
                         is_paid = TRUE,
                         updated_at = NOW()
                     WHERE id = $3`,
                    [billingRes.rows[0].id, shippingRes.rows[0].id, orderId]
                );

                await client.query(
                    `UPDATE case_design
                     SET unfinished = FALSE,
                         updated_at = NOW()
                     WHERE id = $1`,
                    [caseDesignId]
                );

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
                    console.error(
                        "Failed to send order confirmation email",
                        err
                    );
                }
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
