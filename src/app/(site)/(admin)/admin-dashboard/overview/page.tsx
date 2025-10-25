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
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <StatsPeriodFilter
                    value={period}
                    onChange={setPeriod}
                    className="w-full md:w-auto md:ml-auto"
                />
            </div>
            {isLoading ? (
                <DashboardStatsSkeleton count={3} />
            ) : error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                    {(error as Error).message}
                    <button
                        onClick={() => refetch()}
                        className="ml-3 inline-flex rounded-md border px-3 py-1 text-xs"
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
            <ChartAreaOrders
                period={period}
                series={orderSeries}
                isLoading={isOrderSeriesLoading}
                error={isOrderSeriesError as Error | null}
                refetch={orderSeriesRefatch}
                isFetching={isOrderSeriesFetching}
            />
        </div>
    );
}
