"use client";

import axios, { AxiosError } from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { CustomersItem } from "@/app/api/admin/customers/get-all/route";

export type CustomersPage = {
    customers: CustomersItem[];
    nextCursor: string | null;
};

export const adminCustomersKeys = {
    all: ["admin-customers"] as const,
    list: (q: string) => ["admin-customers", q] as const,
};

export type AdminSafeDeleteResponse = {
    ok: true;
    userId: string;
    action: "anonymized_and_banned_permanently";
};

export async function fetchAdminCustomersPage({
    cursor,
    limit = 20,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<CustomersPage> {
    try {
        const res = await axios.get<CustomersPage>(
            `${NEXT_PUBLIC_URL}/api/admin/customers/get-all`,
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
                ? `[${status}] Failed to fetch customers: ${serverMsg}`
                : `Failed to fetch customers: ${serverMsg}`
        );
    }
}

export async function adminSafeDeleteUser({
    userId,
    anonymize = true,
    banReason = "Admin-initiated deactivation",
    signal,
}: {
    userId: string;
    anonymize?: boolean;
    banReason?: string | null;
    signal?: AbortSignal;
}) {
    try {
        const res = await axios.post<AdminSafeDeleteResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/customers/delete`,
            { userId, anonymize, banReason },
            {
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
                ? `[${status}] Failed to delete user: ${serverMsg}`
                : `Failed to delete user: ${serverMsg}`
        );
    }
}
