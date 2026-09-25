import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";
import { ICaseDesign } from "@/lib/types/user-orders.types";
import { getServerSideSession } from "@/hooks/use-session";
import { stripe } from "@/lib/stripe";
import { TAX_RATE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCents(v: number | string | null | undefined) {
    const n = typeof v === "string" ? Number(v) : v;
    return Math.round((Number(n) || 0) * 100);
}
function generateOrderNumber() {
    return `DMC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export interface IPreviewCaseDesign extends ICaseDesign {
    materialPrice: number;
    finishPrice: number;
    croppedImageUrl: string;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: designId } = await params;
    const { user } = await getServerSideSession();
    const userId = user?.id;

    if (!designId || !userId) {
        return NextResponse.json(
            { error: "Missing credentials" },
            { status: 400 }
        );
    }

    const client = await pool.connect();

    try {
        const query = `
      SELECT
        cd.id,
        COALESCE(cd.image, gi.url) AS "imgSrc",
        cd.name AS "caseName",
        cd.cropped_image_url AS "croppedImageUrl",
        pm.model_name AS "modelName",
        cc.name AS "color",
        cc.hex AS "colorHex",
        cm.name AS "material",
        cm.price AS "materialPrice",
        cf.name AS "finish",
        cf.price AS "finishPrice",
        (cm.price + cf.price) AS "price",
        EXISTS (
          SELECT 1 FROM "order" o WHERE o.case_design_id = cd.id
        ) AS "has_order"
      FROM case_design cd
      JOIN phone_model pm ON cd.phone_model_id = pm.id
      JOIN case_color cc ON cd.case_color_id = cc.id
      JOIN case_material cm ON cd.case_material_id = cm.id
      JOIN case_finish cf ON cd.case_finish_id = cf.id
      LEFT JOIN gallery_image gi ON cd.gallery_image_id = gi.id
      WHERE cd.id = $2 AND cd.user_id = $1
      LIMIT 1;
    `;

        const res = await client.query(query, [userId, designId]);

        if (res.rowCount === 0) {
            return NextResponse.json(
                { error: "Design not found" },
                { status: 404 }
            );
        }

        const row = res.rows[0];
        if (row.has_order) {
            return NextResponse.json({
                error: "This design is already associated with an order",
            });
        }

        return NextResponse.json({
            design: {
                id: row.id,
                imgSrc: row.imgSrc,
                caseName: row.caseName,
                croppedImageUrl: row.croppedImageUrl,
                modelName: row.modelName,
                color: row.color,
                material: row.material,
                materialPrice: row.materialPrice,
                finish: row.finish,
                finishPrice: row.finishPrice,
                price: row.price,
            },
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching design preview:", error);
        return NextResponse.json(
            { error: "Failed to fetch design preview" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user } = await getServerSideSession();
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseDesignId } = await params;

    if (!caseDesignId) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const designQuery = `
      SELECT
        cd.id,
        cd.user_id,
        cd.name AS design_name,
        COALESCE(gi.url, cd.image) AS image_url,
        cd.cropped_image_url,
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
            return NextResponse.json(
                { error: "Case design not found" },
                { status: 404 }
            );
        }

        const row = designRes.rows[0] as {
            id: string;
            user_id: string;
            design_name: string | null;
            image_url: string | null;
            cropped_image_url: string | null;
            material_id: string;
            material_name: string;
            material_price: number | string | null;
            finish_id: string;
            finish_name: string;
            finish_price: number | string | null;
            model_name: string;
        };

        if (row.user_id !== user.id) {
            return NextResponse.json(
                { error: "Forbidden: design does not belong to user" },
                { status: 403 }
            );
        }

        const materialCents = toCents(row.material_price);
        const finishCents = toCents(row.finish_price);
        if (Number.isNaN(materialCents) || Number.isNaN(finishCents)) {
            return NextResponse.json(
                { error: "Invalid price values in DB" },
                { status: 500 }
            );
        }

        const subtotalCents = materialCents + finishCents;
        const taxCents = Math.round(subtotalCents * TAX_RATE);
        const totalCents = subtotalCents + taxCents;

        const sub_total = Number((subtotalCents / 100).toFixed(2));
        const tax = Number((taxCents / 100).toFixed(2));
        const total_amount = Number((totalCents / 100).toFixed(2));

        const existingOrderRes = await client.query(
            `SELECT id, order_number FROM "order" WHERE user_id = $1 AND case_design_id = $2 LIMIT 1;`,
            [user.id, caseDesignId]
        );

        let orderId: string;
        let orderNumber: string;

        if ((existingOrderRes.rowCount ?? 0) > 0) {
            orderId = existingOrderRes.rows[0].id;
            orderNumber = existingOrderRes.rows[0].order_number;
        } else {
            let candidate = "";
            for (;;) {
                candidate = generateOrderNumber();
                const check = await client.query(
                    `SELECT 1 FROM "order" WHERE order_number = $1 LIMIT 1;`,
                    [candidate]
                );
                if (check.rowCount === 0) break;
            }
            orderNumber = candidate;

            const insert = await client.query(
                `INSERT INTO "order" (
          user_id, order_number, case_design_id,
          sub_total, tax, total_amount,
          order_status, tracking_number,
          billing_address_id, shipping_address_id,
          created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,NULL,NULL,NULL,NOW(),NOW()
        ) RETURNING id, order_number;`,
                [
                    user.id,
                    orderNumber,
                    caseDesignId,
                    sub_total,
                    tax,
                    total_amount,
                    "PENDING",
                ]
            );
            orderId = insert.rows[0].id;
            orderNumber = insert.rows[0].order_number;
        }

        const product = await stripe.products.create({
            name: `Your ${row.model_name} - ${row.material_name} (${row.finish_name})`,
            description: `Material: ${row.material_name}, Finish: ${row.finish_name}, Subtotal: $${sub_total}, Tax: $${tax}, Total: $${total_amount}`,
            images: row.cropped_image_url ? [row.cropped_image_url] : undefined,
            default_price_data: {
                currency: "cad",
                unit_amount: totalCents,
            },
        });

        const successUrl = `${
            process.env.NEXT_PUBLIC_BASE_URL
        }/thank-you/${encodeURIComponent(orderId)}`;
        const cancelUrl = `${
            process.env.NEXT_PUBLIC_BASE_URL
        }/configure/preview/${encodeURIComponent(caseDesignId)}`;

        const session = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_method_types: ["card"],
            mode: "payment",
            shipping_address_collection: { allowed_countries: ["CA"] },
            metadata: { userId: user.id, orderId, caseDesignId },
            line_items: [
                { price: product.default_price as string, quantity: 1 },
            ],
            customer_email: user.email,
        });

        return NextResponse.json({
            success: true,
            url: session.url,
            orderId,
            orderNumber,
            amount: total_amount,
        });
    } catch (err) {
        console.error("Checkout create failed:", err);
        return NextResponse.json(
            {
                success: false,
                error:
                    err instanceof Error
                        ? err?.message
                        : "Failed to create checkout session",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
