"use client";

import axios, { AxiosError } from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";

export interface OrdersResponse {
    success: boolean;
    order: IUserOrderWithDesign | null;
    error?: string;
    status?: number;
}

export const getOrderById = async (
    _userId: string,
    orderId: string
): Promise<OrdersResponse> => {
    try {
        const res = await axios.get<{
            order?: IUserOrderWithDesign;
            error?: string;
        }>(`${NEXT_PUBLIC_URL}/api/account/get-orders-by-user-id/${orderId}`, {
            withCredentials: true,
            timeout: 15000,
            validateStatus: () => true,
        });

        const status = res.status;
        const data = res.data ?? {};

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
        if (status < 200 || status >= 300 || !data.order) {
            return {
                success: false,
                order: null,
                error: data.error || "Failed to fetch order",
                status,
            };
        }

        return { success: true, order: data.order, status };
    } catch (err) {
        const ax = err as AxiosError<{ error?: string }>;
        const status = ax.response?.status ?? 500;
        const serverMsg =
            ax.response?.data?.error || ax.message || "Unknown error";
        return { success: false, order: null, error: serverMsg, status };
    }
};
