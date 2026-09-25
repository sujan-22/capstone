"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { StatsResponse } from "../actions/actions";
import { StatsPeriod } from "./period-filter";

const PERIOD_LABEL: Record<StatsPeriod, string> = {
    "7d": "the previous 7 days",
    "30d": "the previous 30 days",
    "90d": "the previous 3 months",
};

function Delta({ delta }: { delta: number | null }) {
    if (delta === null) {
        return (
            <span className="type-label rounded-full bg-cobalt-tint px-2 py-1 text-cobalt">
                New
            </span>
        );
    }
    const pct = Math.abs(delta * 100).toFixed(1) + "%";
    const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs font-medium",
                delta > 0
                    ? "bg-success/10 text-success"
                    : delta < 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-ink/[0.06] text-ink-soft"
            )}
        >
            <Icon aria-hidden className="size-3.5" />
            {pct}
            <span className="sr-only">
                {delta > 0 ? " up" : delta < 0 ? " down" : " unchanged"}
            </span>
        </span>
    );
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

    const cells = [
        {
            label: "Revenue",
            value: formatPrice(Number(revenue.cents || 0)),
            previous: formatPrice(Number(revenue.prevCents || 0)),
            delta: revenue.deltaPct,
        },
        {
            label: "Orders",
            value: Number(orders.count || 0).toLocaleString(),
            previous: Number(orders.prevCount || 0).toLocaleString(),
            delta: orders.deltaPct,
        },
        {
            label: "New customers",
            value: Number(newCustomers.count || 0).toLocaleString(),
            previous: Number(newCustomers.prevCount || 0).toLocaleString(),
            delta: newCustomers.deltaPct,
        },
    ];

    return (
        <dl
            aria-busy={isRefreshing || undefined}
            className={cn(
                "grid overflow-hidden rounded-md border border-rule bg-paper-raised transition-opacity sm:grid-cols-3",
                isRefreshing && "opacity-70"
            )}
        >
            {cells.map((cell, i) => (
                <div
                    key={cell.label}
                    className={cn(
                        "p-6",
                        i > 0 && "border-t border-rule sm:border-l sm:border-t-0"
                    )}
                >
                    <div className="flex items-center justify-between gap-3">
                        <dt className="type-label text-ink-soft">{cell.label}</dt>
                        <Delta delta={cell.delta} />
                    </div>
                    <dd className="mt-5 text-[2.5rem] leading-none font-extrabold tracking-[-0.05em] tabular-nums wdth-expanded">
                        {cell.value}
                    </dd>
                    <dd className="mt-3 text-sm text-ink-soft">
                        {cell.previous} in {PERIOD_LABEL[period]}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
