import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { IUserOrderWithDesign, OrderRow } from "@/lib/types/user-orders.types";
import { getServerSideSession } from "@/hooks/use-session";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { user } = await getServerSideSession();
        const userId = user?.id;
        const isAdmin = user?.role === "admin";
        const { orderId } = await params;
        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        if (!orderId) {
            return NextResponse.json(
                { error: "Order id not found" },
                { status: 401 }
            );
        }

        const client = await pool.connect();
        try {
            const q = `
                SELECT
                  o.id AS order_id,
                  o.user_id,
                  o.order_number,
                  o.case_design_id,
                  o.sub_total,
                  o.tax,
                  o.total_amount,
                  o.order_status,
                  o.tracking_number,
                  o.billing_address_id,
                  o.shipping_address_id,
                  o.created_at AS order_createdat,
                  o.updated_at AS order_updatedat,
                  o.is_paid,

                  -- Case design info
                  cd.id AS design_id,
                  COALESCE(cd.image, gi.url) AS "imgSrc",
                  cd.cropped_image_url AS cropped_image_url,
                  cd.name AS "caseName",
                  cd.has_requested_to_share_publicly AS "hasRequestedToSharePublicly",
                  cd.is_shared_publicly AS "isSharedPublicly",
                  pm.model_name AS "modelName",
                  cc.name AS "color",
                  cc.hex AS "colorHex",
                  cm.name AS "material",
                  cf.name AS "finish",
                  (cm.price + cf.price) AS "price",

                  -- Billing address
                  ba.id AS billing_id,
                  ba.name AS billing_name,
                  ba.street AS billing_street,
                  ba.city AS billing_city,
                  ba.postal_code AS billing_postal_code,
                  ba.country AS billing_country,
                  ba.state AS billing_state,
                  ba.phone_number AS billing_phone_number,

                  -- Shipping address
                  sa.id AS shipping_id,
                  sa.name AS shipping_name,
                  sa.street AS shipping_street,
                  sa.city AS shipping_city,
                  sa.postal_code AS shipping_postal_code,
                  sa.country AS shipping_country,
                  sa.state AS shipping_state,
                  sa.phone_number AS shipping_phone_number

                FROM "order" o
                JOIN case_design cd ON o.case_design_id = cd.id
                JOIN phone_model pm ON cd.phone_model_id = pm.id
                JOIN case_color cc ON cd.case_color_id = cc.id
                JOIN case_material cm ON cd.case_material_id = cm.id
                JOIN case_finish cf ON cd.case_finish_id = cf.id
                LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
                LEFT JOIN billing_address ba ON o.billing_address_id = ba.id
                LEFT JOIN shipping_address sa ON o.shipping_address_id = sa.id
                WHERE o.id = $1 AND (o.user_id = $2 OR $3::boolean IS TRUE)
                LIMIT 1
            `;

            const { rows } = await client.query<OrderRow>(q, [
                orderId,
                userId,
                isAdmin,
            ]);

            if (!rows.length) {
                return NextResponse.json(
                    { error: "Order not found" },
                    { status: 404 }
                );
            }

            const r = rows[0];

            if (!r.is_paid) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Order not paid",
                        reason: "The payment for this order has not been completed.",
                    },
                    { status: 403 }
                );
            }

            const order: IUserOrderWithDesign = {
                id: String(r.order_id),
                orderNumber: r.order_number,
                subtotal: Number(r.sub_total),
                tax: Number(r.tax),
                totalAmount: Number(r.total_amount),
                orderStatus: String(r.order_status),
                trackingNumber: r.tracking_number ?? null,
                billingAddress: r.billing_id
                    ? {
                          id: r.billing_id,
                          name: r.billing_name,
                          street: r.billing_street,
                          city: r.billing_city,
                          postal_code: r.billing_postal_code,
                          country: r.billing_country,
                          state: r.billing_state,
                          phone_number: r.billing_phone_number,
                      }
                    : null,
                shippingAddress: r.shipping_id
                    ? {
                          id: r.shipping_id,
                          name: r.shipping_name,
                          street: r.shipping_street,
                          city: r.shipping_city,
                          postal_code: r.shipping_postal_code,
                          country: r.shipping_country,
                          state: r.shipping_state,
                          phone_number: r.shipping_phone_number,
                      }
                    : null,
                createdAt: r.order_createdat
                    ? new Date(r.order_createdat).toISOString()
                    : "",
                updatedAt: r.order_updatedat
                    ? new Date(r.order_updatedat).toISOString()
                    : "",
                design: {
                    id: String(r.design_id),
                    imgSrc: r.imgSrc,
                    caseName: r.caseName,
                    modelName: r.modelName,
                    color: r.color,
                    material: r.material,
                    finish: r.finish,
                    price: Number(r.price),
                    croppedImgUrl: r.cropped_image_url,
                    colorHex: r.colorHex,
                    hasRequestedToSharePublicly: r.hasRequestedToSharePublicly,
                    isSharedPublicly: r.isSharedPublicly,
                },
            };

            return NextResponse.json({ order }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in get-orders-with-designs:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId: caseDesignId } = await params;

        const { user } = await getServerSideSession();
        if (!user?.id || !caseDesignId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await pool.connect();
        try {
            const verifyRes = await client.query(
                `SELECT id FROM case_design WHERE id = $1 AND user_id = $2`,
                [caseDesignId, user.id]
            );

            if (verifyRes.rowCount === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Unauthorized or design not found",
                    },
                    { status: 403 }
                );
            }

            await client.query(
                `UPDATE case_design
           SET has_requested_to_share_publicly = TRUE,
               updated_at = NOW()
         WHERE id = $1`,
                [caseDesignId]
            );

            return NextResponse.json({
                success: true,
                message: "Successfully requested to share the design publicly.",
            });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in request-share API:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
