"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";

export interface OrdersResponse {
    success: boolean;
    order: IUserOrderWithDesign | null;
    error?: string;
}

export const getOrderById = async (
    userId: string,
    orderId: string
): Promise<OrdersResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/get-order-by-id`,
            {
                method: "GET",
                headers: {
                    "x-order-id": orderId,
                    "x-user-id": userId,
                },
                cache: "default",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: { order: IUserOrderWithDesign } = await res.json();

        return {
            success: true,
            order: data.order,
        };
    } catch (err) {
        return {
            success: false,
            order: null,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
