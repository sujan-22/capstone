import { pool } from "@/lib/database/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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
            if (!event.data.object.customer_details?.email) {
                throw new Error("Missing user email");
            }

            const session = event.data.object as Stripe.Checkout.Session;

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

                await client.query("COMMIT");
            } catch (err) {
                await client.query("ROLLBACK");
                throw err;
            } finally {
                client.release();
            }

            // await resend.emails.send({
            //     from: "RoboCase <sujanrokad44@gmail.com>",
            //     to: [event.data.object.customer_details.email],
            //     subject: "Thank you for your order",
            //     react: OrderEmail({
            //         orderId,
            //         orderDate: updatedOrder.createdAt.toLocaleDateString(),
            //         // @ts-ignore
            //         shippingAddress: {
            //             name: session.customer_details!.name!,
            //             city: shippingAddress!.city!,
            //             country: shippingAddress!.country!,
            //             postalCode: shippingAddress!.postal_code!,
            //             state: shippingAddress!.state!,
            //             street: shippingAddress!.line1!,
            //         },
            //     }),
            // });
        }

        return NextResponse.json({ result: event, ok: true });
    } catch (error) {
        console.log(error);
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
