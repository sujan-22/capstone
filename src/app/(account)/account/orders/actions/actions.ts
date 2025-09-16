"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
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
            `${NEXT_PUBLIC_URL}/api/get-orders-by-user-id`,
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
