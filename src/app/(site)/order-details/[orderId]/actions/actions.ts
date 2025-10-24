"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";

export interface OrdersResponse {
    success: boolean;
    order: IUserOrderWithDesign | null;
    error?: string;
    status?: number;
}

export const getOrderById = async (
    userId: string,
    orderId: string
): Promise<OrdersResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/get-orders-by-user-id/${orderId}`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "no-store",
            }
        );

        const status = res.status;
        const data = await res.json().catch(() => ({}));
        console.log("Order fetch response data:", data);

        if (status === 401) {
            return {
                success: false,
                order: null,
                error: data.error || "Not authenticated",
                status,
            };
        }

        if (status === 400) {
            return {
                success: false,
                order: null,
                error: data.error || "Invalid request",
                status,
            };
        }

        if (status === 403) {
            return {
                success: false,
                order: null,
                error: data.error || "Order not paid",
                status,
            };
        }

        if (status === 404) {
            return {
                success: false,
                order: null,
                error: data.error || "Order not found",
                status,
            };
        }

        if (!res.ok || !data.order) {
            return {
                success: false,
                order: null,
                error: data.error || "Failed to fetch order",
                status,
            };
        }

        return {
            success: true,
            order: data.order,
            status,
        };
    } catch (err) {
        return {
            success: false,
            order: null,
            error: err instanceof Error ? err.message : "Unknown error",
            status: 500,
        };
    }
};
