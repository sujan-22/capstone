"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { pool } from "@/lib/database/db";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";

export interface OrdersResponse {
    success: boolean;
    orders: IUserOrderWithDesign[];
    error?: string;
}

export const getOrdersByUser = async (
    userId: string
): Promise<OrdersResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/get-orders-by-user-id`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "default",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: { orders: IUserOrderWithDesign[] } = await res.json();

        return {
            success: true,
            orders: data.orders,
        };
    } catch (err) {
        return {
            success: false,
            orders: [],
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export const handleRequestToShareDesign = async (
    caseDesignId: string,
    userId: string
) => {
    try {
        const client = await pool.connect();

        try {
            const verifyRes = await client.query(
                `SELECT id FROM case_design WHERE id = $1 AND user_id = $2`,
                [caseDesignId, userId]
            );

            if (verifyRes.rowCount === 0) {
                throw new Error("Unauthorized or design not found");
            }

            await client.query(
                `UPDATE case_design
   SET has_requested_to_share_publicly = TRUE,
       updated_at = NOW()
   WHERE id = $1`,
                [caseDesignId]
            );

            return {
                success: true,
                message: "Successfully requested to share the design publicly.",
            };
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error in handleRequestToShareDesign:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
