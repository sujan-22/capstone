"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StatsPeriodFilter, { StatsPeriod } from "./components/period-filter";
import { DashboardStats } from "./components/dashboard-stats";
import {
    adminOrdersTsKeys,
    adminStatsKeys,
    fetchAdminOrdersTimeseries,
    fetchAdminStats,
    OrdersTimeseriesResponse,
    StatsResponse,
} from "./actions/actions";
import { DashboardStatsSkeleton } from "./components/dashboard-stat-skeleton";
import { ChartAreaOrders } from "./components/orders-series";
import { LatestOrders } from "./components/latest-orders";
import AdminPageHeader from "../components/page-header";

export default function DashboardOverview() {
    const [period, setPeriod] = useState<StatsPeriod>("30d");

    const { data, isLoading, error, refetch, isFetching } =
        useQuery<StatsResponse>({
            queryKey: adminStatsKeys.list(period),
            queryFn: ({ signal }) => fetchAdminStats({ period, signal }),
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
        });

    const {
        data: orderSeries,
        isLoading: isOrderSeriesLoading,
        error: isOrderSeriesError,
        refetch: orderSeriesRefatch,
        isFetching: isOrderSeriesFetching,
    } = useQuery<OrdersTimeseriesResponse>({
        queryKey: adminOrdersTsKeys.list(period),
        queryFn: ({ signal }) => fetchAdminOrdersTimeseries({ period, signal }),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    return (
        <div className="space-y-8">
            <AdminPageHeader
                eyebrow="01 · Overview"
                title="Overview"
                description="How the shop is doing: revenue, orders and sign-ups against the period before."
                actions={<StatsPeriodFilter value={period} onChange={setPeriod} />}
            />

            {isLoading ? (
                <DashboardStatsSkeleton count={3} />
            ) : error ? (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-4 text-sm">
                    <span className="text-destructive">
                        {(error as Error).message}
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold hover:border-ink"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <DashboardStats
                    period={period}
                    stats={data!}
                    isRefreshing={isFetching}
                />
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <ChartAreaOrders
                    period={period}
                    series={orderSeries}
                    isLoading={isOrderSeriesLoading}
                    error={isOrderSeriesError as Error | null}
                    refetch={orderSeriesRefatch}
                    isFetching={isOrderSeriesFetching}
                />
                <LatestOrders
                    series={orderSeries}
                    isLoading={isOrderSeriesLoading}
                />
            </div>
        </div>
    );
}
