"use client";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import axios, { AxiosError } from "axios";

export type StatsPeriod = "7d" | "30d" | "90d";

export type StatsResponse = {
    period: StatsPeriod;
    range: { start: string; end: string };
    prevRange: { start: string; end: string };
    revenue: { cents: number; prevCents: number; deltaPct: number | null };
    newCustomers: { count: number; prevCount: number; deltaPct: number | null };
    orders: { count: number; prevCount: number; deltaPct: number | null };
};

export const adminStatsKeys = {
    all: ["admin-stats"] as const,
    list: (period: StatsPeriod) => ["admin-stats", period] as const,
};

export async function fetchAdminStats({
    period,
    signal,
}: {
    period: StatsPeriod;
    signal?: AbortSignal;
}): Promise<StatsResponse> {
    try {
        const res = await axios.get<StatsResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/overview/stats`,
            {
                params: { period },
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
            (ax.response?.data &&
                (ax.response.data.error || ax.response.data.message)) ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to fetch admin stats: ${serverMsg}`
                : `Failed to fetch admin stats: ${serverMsg}`
        );
    }
}

export type OrdersTimeseriesResponse = {
    period: StatsPeriod;
    range: { start: string; end: string };
    timezone: string;
    buckets: Array<{ day: string; count: number; revenue: number }>;
    orders: Array<{
        id: string;
        createdAt: string;
        customerName: string;
        amount: number;
    }>;
};

export const adminOrdersTsKeys = {
    all: ["admin-orders-ts"] as const,
    list: (period: StatsPeriod) => ["admin-orders-ts", period] as const,
};

export async function fetchAdminOrdersTimeseries({
    period,
    signal,
}: {
    period: StatsPeriod;
    signal?: AbortSignal;
}): Promise<OrdersTimeseriesResponse> {
    try {
        const res = await axios.get<OrdersTimeseriesResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/overview/orders-timeseries`,
            {
                params: { period },
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
                ? `[${status}] Failed to fetch orders time-series: ${serverMsg}`
                : `Failed to fetch orders time-series: ${serverMsg}`
        );
    }
}
