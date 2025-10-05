"use server";

import { IPreviewCaseDesign } from "@/app/api/configure/preview/[id]/route";
import { NEXT_PUBLIC_URL, TAX_RATE } from "@/lib/constants";
import { pool } from "@/lib/database/db";
import { generateOrderNumber, stripe, toCents } from "@/lib/stripe";

export interface GetDesignPreviewResponse {
    success: boolean;
    design?: IPreviewCaseDesign;
    error?: string;
}

export const getDesignPreview = async (
    designId: string,
    userId: string
): Promise<GetDesignPreviewResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/configure/preview/${encodeURIComponent(
                designId
            )}`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "no-store",
            }
        );

        const data = await res.json();

        if (!res.ok || data.error) {
            return {
                success: false,
                error: data.error || "Failed to fetch design preview",
            };
        }

        return {
            success: true,
            design: data.designPreview as IPreviewCaseDesign,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export const createCheckoutSession = async ({
    caseDesignId,
    userId,
    userEmail,
}: {
    caseDesignId: string;
    userId: string;
    userEmail: string;
}) => {
    const client = await pool.connect();
    try {
        const designQuery = `
      SELECT
        cd.id,
        cd.user_id,
        cd.name AS design_name,
        COALESCE(gi.url, cd.image) AS image_url,
        cd.cropped_image_url AS croppedImgUrl,
        cm.id AS material_id,
        cm.name AS material_name,
        pm.model_name AS model_name,
        cm.price AS material_price,
        cf.id AS finish_id,
        cf.name AS finish_name,
        cf.price AS finish_price
      FROM case_design cd
      JOIN case_material cm ON cm.id = cd.case_material_id
      JOIN case_finish cf ON cf.id = cd.case_finish_id
      JOIN phone_model pm ON pm.id = cd.phone_model_id
      LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
      WHERE cd.id = $1
      LIMIT 1;
    `;

        const designRes = await client.query(designQuery, [caseDesignId]);

        if (designRes.rowCount === 0) {
            throw new Error("Case design not found");
        }

        const row = designRes.rows[0] as {
            id: string;
            user_id: string;
            design_name: string | null;
            image_url: string | null;
            material_id: string;
            material_name: string;
            material_price: number | string | null;
            finish_id: string;
            finish_name: string;
            finish_price: number | string | null;
            model_name: string;
        };

        if (row.user_id !== userId) {
            throw new Error("Unauthorized: design does not belong to user");
        }

        const materialRaw = row.material_price;
        const finishRaw = row.finish_price;

        const materialPriceCents = toCents(materialRaw);
        const finishPriceCents = toCents(finishRaw);

        if (
            Number.isNaN(materialPriceCents) ||
            Number.isNaN(finishPriceCents)
        ) {
            throw new Error("Invalid price values in DB");
        }

        const subtotalCents = materialPriceCents + finishPriceCents;
        const taxCents = Math.round(subtotalCents * TAX_RATE);
        const totalCents = subtotalCents + taxCents;

        const sub_total = Number((subtotalCents / 100).toFixed(2));
        const tax = Number((taxCents / 100).toFixed(2));
        const total_amount = Number((totalCents / 100).toFixed(2));

        const existingOrderRes = await client.query(
            `SELECT id, order_number FROM "order" WHERE user_id = $1 AND case_design_id = $2 LIMIT 1;`,
            [userId, caseDesignId]
        );

        let orderId: string;
        let orderNumber: string;

        if ((existingOrderRes.rowCount ?? 0) > 0) {
            orderId = existingOrderRes.rows[0].id;
            orderNumber = existingOrderRes.rows[0].order_number;
        } else {
            let isUnique = false;
            let candidate: string;
            while (!isUnique) {
                candidate = generateOrderNumber();
                const checkRes = await client.query(
                    `SELECT 1 FROM "order" WHERE order_number = $1 LIMIT 1;`,
                    [candidate]
                );
                if (checkRes.rowCount === 0) {
                    isUnique = true;
                }
            }
            orderNumber = candidate!;

            const insertRes = await client.query(
                `INSERT INTO "order" (
      user_id,
      order_number,
      case_design_id,
      sub_total,
      tax,
      total_amount,
      order_status,
      tracking_number,
      billing_address_id,
      shipping_address_id,
      created_at,
      updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,NULL,NULL,NULL,NOW(),NOW()
    ) RETURNING id, order_number;`,
                [
                    userId,
                    orderNumber,
                    caseDesignId,
                    sub_total,
                    tax,
                    total_amount,
                    "PENDING",
                ]
            );

            orderId = insertRes.rows[0].id;
            orderNumber = insertRes.rows[0].order_number;
        }

        const product = await stripe.products.create({
            name: `Your ${row.model_name} - ${row.material_name} (${row.finish_name})`,
            description: `Material: ${row.material_name}, Finish: ${row.finish_name}, Subtotal: $${sub_total}, Tax: $${tax}, Total: $${total_amount}`,
            images: row.image_url ? [row.image_url] : undefined,
            default_price_data: {
                currency: "cad",
                unit_amount: totalCents,
            },
        });

        const successUrl = `${NEXT_PUBLIC_URL}/thank-you/${encodeURIComponent(
            orderId
        )}`;
        const cancelUrl = `${NEXT_PUBLIC_URL}/configure/preview/${encodeURIComponent(
            caseDesignId
        )}`;

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_method_types: ["card"],
            mode: "payment",
            shipping_address_collection: {
                allowed_countries: ["CA"],
            },
            metadata: {
                userId,
                orderId,
                caseDesignId,
            },
            line_items: [
                { price: product.default_price as string, quantity: 1 },
            ],
            customer_email: userEmail,
        });

        return {
            url: stripeSession.url,
            orderId,
            orderNumber,
            amount: total_amount,
        };
    } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
    } finally {
        client.release();
    }
};
