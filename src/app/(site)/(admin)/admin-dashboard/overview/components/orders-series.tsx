"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    orders: { label: "Orders", color: "var(--primary)" },
} satisfies ChartConfig;

type Props = {
    period: StatsPeriod;
    series?: OrdersTimeseriesResponse;
    isLoading?: boolean;
    error?: Error | null;
    refetch: () => void;
    isFetching: boolean;
};

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

    const title = "Orders Over Time";
    const desc =
        period === "7d"
            ? "Last 7 days"
            : period === "30d"
            ? "Last 30 days"
            : "Last 3 months";

    if (isLoading || isFetching || !series) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <Skeleton className="w-full h-[250px]" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                        <div className="text-destructive">
                            Failed to load orders time-series.
                        </div>
                        <Button size="sm" variant="outline" onClick={refetch}>
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
                <CardAction></CardAction>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
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
                                    stopOpacity={0.9}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-orders, var(--primary))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
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
                            type="natural"
                            fill="url(#fillOrders)"
                            stroke="var(--color-orders, var(--primary))"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
