"use client";

import { formatPrice } from "@/lib/utils";
import { StatsResponse } from "../actions/actions";
import DashboardStatCard from "./dashboard-stat";
import { StatsPeriod } from "./period-filter";

function formatDelta(delta: number | null): {
    text: string;
    trend: "up" | "down" | null;
} {
    if (delta === null) return { text: "—", trend: null };
    if (delta === 0) return { text: "0.0%", trend: null };
    const pct = (delta * 100).toFixed(1) + "%";
    return { text: pct, trend: delta > 0 ? "up" : "down" };
}

export function DashboardStats({
    period,
    stats,
    isRefreshing,
}: {
    period: StatsPeriod;
    stats: StatsResponse;
    isRefreshing: boolean;
}) {
    const { revenue, newCustomers, orders } = stats;

    const revenueDelta = formatDelta(revenue.deltaPct);
    const customersDelta = formatDelta(newCustomers.deltaPct);
    const ordersDelta = formatDelta(orders.deltaPct);

    const cards = [
        {
            title: "Total Revenue",
            value: formatPrice(Number(revenue.cents || 0)),
            trend: (revenueDelta.trend ?? "up") as "up" | "down",
            trendText: revenueDelta.text,
            caption:
                revenueDelta.trend === null
                    ? "New activity this period"
                    : revenueDelta.trend === "up"
                    ? "Trending up"
                    : "Trending down",
            subcaption: "Compared to previous period",
        },
        {
            title: "New Customers",
            value: Number(newCustomers.count || 0).toLocaleString(),
            trend: (customersDelta.trend ?? "up") as "up" | "down",
            trendText: customersDelta.text,
            caption:
                customersDelta.trend === null
                    ? "No prior baseline"
                    : customersDelta.trend === "up"
                    ? "Growth in sign-ups"
                    : "Fewer sign-ups",
            subcaption: "Compared to previous period",
        },
        {
            title: "Orders",
            value: Number(orders.count || 0).toLocaleString(),
            trend: (ordersDelta.trend ?? "up") as "up" | "down",
            trendText: ordersDelta.text,
            caption:
                ordersDelta.trend === null
                    ? "New order activity"
                    : ordersDelta.trend === "up"
                    ? "Healthy velocity"
                    : "Cooling velocity",
            subcaption: "Compared to previous period",
        },
    ] as const;

    return (
        <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                isRefreshing ? "opacity-90 transition-opacity" : ""
            }`}
        >
            {cards.map((c) => (
                <DashboardStatCard
                    key={c.title}
                    title={c.title}
                    value={c.value}
                    trend={c.trend}
                    trendText={c.trendText}
                    caption={c.caption}
                    subcaption={c.subcaption}
                    period={period}
                />
            ))}
        </div>
    );
}
