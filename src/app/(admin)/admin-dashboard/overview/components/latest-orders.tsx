"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import type { OrdersTimeseriesResponse } from "../actions/actions";

/** The most recent orders in the selected period, newest first. */
export function LatestOrders({
    series,
    isLoading,
}: {
    series?: OrdersTimeseriesResponse;
    isLoading: boolean;
}) {
    const orders = [...(series?.orders ?? [])]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6);

    return (
        <section
            aria-labelledby="latest-orders"
            className="flex flex-col rounded-md border border-rule bg-paper-raised"
        >
            <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-4">
                <h2 id="latest-orders" className="type-heading">
                    Latest orders
                </h2>
                <Link
                    href="/admin-dashboard/orders"
                    className="group inline-flex items-center gap-1 text-sm font-semibold text-cobalt"
                >
                    All orders
                    <ArrowRight
                        aria-hidden
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-3 p-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-9" />
                    ))}
                </div>
            ) : orders.length ? (
                <ul className="divide-y divide-rule">
                    {orders.map((o) => (
                        <li key={o.id}>
                            <Link
                                href={`/order-details/${encodeURIComponent(o.id)}`}
                                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.025]"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold">
                                        {o.customerName}
                                    </span>
                                    <span className="block text-xs text-ink-soft">
                                        {new Intl.DateTimeFormat("en-CA", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        }).format(new Date(o.createdAt))}
                                    </span>
                                </span>
                                <span className="shrink-0 font-mono text-sm font-medium">
                                    {formatPrice(o.amount)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="px-5 py-10 text-center text-sm text-ink-soft">
                    No orders in this period yet.
                </p>
            )}
        </section>
    );
}
