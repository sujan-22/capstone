"use client";

import { http } from "@/lib/http";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";

export interface OrdersResponse {
    success: boolean;
    orders: IUserOrderWithDesign[];
    error?: string;
}

export const getOrdersByUser = async (): Promise<OrdersResponse> => {
    try {
        const { data } = await http.get<{
            orders: IUserOrderWithDesign[];
        }>("/api/account/get-orders-by-user-id");

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
    caseDesignId: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const { data } = await http.post<{
            success: boolean;
            message?: string;
            error?: string;
        }>(`/api/account/get-orders-by-user-id/${caseDesignId}`);

        return data;
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Unknown error",
        };
    }
};
