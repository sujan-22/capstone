"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { OrdersTimeseriesResponse, StatsPeriod } from "../actions/actions";
import {
    formatPrice,
    fullLabelFromYmd,
    labelFromYmd,
    ymdInTz,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const chartConfig = {
    orders: { label: "Orders", color: "var(--cobalt)" },
} satisfies ChartConfig;

type Props = {
    period: StatsPeriod;
    series?: OrdersTimeseriesResponse;
    isLoading?: boolean;
    error?: Error | null;
    refetch: () => void;
    isFetching: boolean;
};

function Panel({
    title,
    desc,
    total,
    children,
}: {
    title: string;
    desc: string;
    total?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section
            aria-label={title}
            className="rounded-md border border-rule bg-paper-raised"
        >
            <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
                <div>
                    <h2 className="type-heading">{title}</h2>
                    <p className="mt-1 text-sm text-ink-soft">{desc}</p>
                </div>
                {total}
            </div>
            <div className="px-2 pb-4 pt-5 sm:px-5">{children}</div>
        </section>
    );
}

export function ChartAreaOrders({
    period,
    series,
    isLoading,
    error,
    refetch,
    isFetching,
}: Props) {
    const isMobile = useIsMobile();
    const STORE_TZ = series?.timezone ?? "America/Toronto";

    const dayOrders = React.useMemo(() => {
        const map = new Map<
            string,
            {
                id: string;
                customerName: string;
                amount: number;
                createdAt: string;
            }[]
        >();
        if (series?.orders) {
            for (const o of series.orders) {
                const key = ymdInTz(o.createdAt, STORE_TZ);
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(o);
            }
            for (const [k, arr] of map) {
                arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                map.set(k, arr);
            }
        }
        return map;
    }, [series, STORE_TZ]);

    const data = React.useMemo(() => {
        let revCum = 0;
        let cntCum = 0;
        return (series?.buckets ?? []).map((b) => {
            const revenue = Number(b.revenue || 0);
            const count = Number(b.count || 0);
            revCum += revenue;
            cntCum += count;
            return {
                date: b.day,
                count,
                revenue,
                revenueCum: revCum,
                countCum: cntCum,
            };
        });
    }, [series]);

    const title = "Orders over time";
    const desc =
        period === "7d"
            ? "Last 7 days"
            : period === "30d"
            ? "Last 30 days"
            : "Last 3 months";

    if (isLoading || isFetching || !series) {
        return (
            <Panel title={title} desc={desc}>
                <Skeleton className="h-[260px] w-full" />
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel title={title} desc={desc}>
                <div className="flex flex-col items-start gap-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-4 text-sm">
                    <p className="text-destructive">
                        Failed to load orders over time.
                    </p>
                    <Button size="sm" variant="outline" onClick={refetch}>
                        Retry
                    </Button>
                </div>
            </Panel>
        );
    }

    const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <Panel
            title={title}
            desc={desc}
            total={
                <span className="text-right">
                    <span className="block font-mono text-2xl font-medium tracking-tight">
                        {totalOrders}
                    </span>
                    <span className="type-label text-ink-soft">orders</span>
                </span>
            }
        >
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[260px] w-full"
                >
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="fillOrders"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-orders, var(--primary))"
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-orders, var(--primary))"
                                    stopOpacity={0.02}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} strokeDasharray="3 4" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                            minTickGap={isMobile ? 24 : 32}
                            tickFormatter={(value: string) =>
                                labelFromYmd(value, STORE_TZ)
                            }
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    // @ts-expect-error to be fixed later
                                    labelFormatter={(value: string) =>
                                        fullLabelFromYmd(value, STORE_TZ)
                                    }
                                    formatter={(_val, _name, ctx) => {
                                        const day = (ctx?.payload &&
                                            ctx.payload.date) as string;
                                        const point = data.find(
                                            (d) => d.date === day
                                        );
                                        const orders = dayOrders.get(day) ?? [];

                                        const incremental = point?.revenue ?? 0;
                                        const revenueCum =
                                            point?.revenueCum ?? 0;
                                        const prevTotal = Math.max(
                                            0,
                                            revenueCum - incremental
                                        );
                                        const newTotal =
                                            prevTotal + incremental;

                                        return (
                                            <div className="space-y-2">
                                                <div className="text-xs">
                                                    <div className="text-muted-foreground">
                                                        Total before:{" "}
                                                        <span className="font-medium">
                                                            {formatPrice(
                                                                prevTotal
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        New total:{" "}
                                                        <span className="font-medium">
                                                            {formatPrice(
                                                                newTotal
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-xs">
                                                    <span className="font-medium">
                                                        {formatPrice(
                                                            incremental
                                                        )}
                                                    </span>
                                                    {orders.length > 0 && (
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            · {
                                                                orders.length
                                                            }{" "}
                                                            order(s)
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="max-h-44 w-[240px] overflow-auto pr-1">
                                                    {orders.length === 0 ? (
                                                        <div className="text-xs text-muted-foreground">
                                                            No orders
                                                        </div>
                                                    ) : (
                                                        orders
                                                            .slice(0, 8)
                                                            .map((o) => (
                                                                <div
                                                                    key={o.id}
                                                                    className="flex items-center justify-between text-xs"
                                                                >
                                                                    <span className="truncate pr-2">
                                                                        {
                                                                            o.customerName
                                                                        }
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatPrice(
                                                                            o.amount
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ))
                                                    )}
                                                    {orders.length > 8 && (
                                                        <div className="pt-1 text-right text-[10px] text-muted-foreground">
                                                            +{orders.length - 8}{" "}
                                                            more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill="url(#fillOrders)"
                            strokeWidth={2}
                            stroke="var(--color-orders, var(--primary))"
                        />
                    </AreaChart>
                </ChartContainer>
        </Panel>
    );
}
