"use client";

import axios, { AxiosError } from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";

export type OrderListItem = {
    id: string;
    orderNumber: string;
    caseDesign: {
        id: string;
        hasRequestedToSharePublicly: boolean;
        isSharedPublicly: boolean;
    };
    status: string;
    createdAt: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
};

export type OrdersPage = {
    orders: OrderListItem[];
    nextCursor: string | null;
};

export const adminOrdersKeys = {
    all: ["admin-orders"] as const,
    list: (q: string) => ["admin-orders", q] as const,
};

export async function fetchAdminOrdersPage({
    cursor,
    limit = 20,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<OrdersPage> {
    try {
        const res = await axios.get<OrdersPage>(
            `${NEXT_PUBLIC_URL}/api/admin/orders/get-all`,
            {
                params: { cursor, limit, q },
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<{ error?: string; message?: string }>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to fetch orders: ${serverMsg}`
                : `Failed to fetch orders: ${serverMsg}`
        );
    }
}

export type AllowedOrderStatus = "PENDING" | "SHIPPED" | "FULFILLED";

export async function updateAdminOrderStatus({
    id,
    status,
    signal,
}: {
    id: string;
    status: AllowedOrderStatus | string;
    signal?: AbortSignal;
}): Promise<void> {
    try {
        await axios.patch(
            `${NEXT_PUBLIC_URL}/api/admin/orders/update-status/${encodeURIComponent(
                id
            )}`,
            { status },
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
    } catch (err) {
        const ax = err as AxiosError<{ error?: string; message?: string }>;
        const statusCode = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            statusCode
                ? `[${statusCode}] Failed to update order status: ${serverMsg}`
                : `Failed to update order status: ${serverMsg}`
        );
    }
}
