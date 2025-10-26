"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IUser } from "../../../../../../../auth-client";
import {
    adminOrdersKeys,
    fetchAdminOrdersPage,
    OrderListItem,
    OrdersPage,
} from "../actions/actions";
import { OrdersTable } from "./orders";

export default function OrdersOverview({}: { user: IUser }) {
    const [q, setQ] = React.useState<string>("");

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery<OrdersPage>({
        queryKey: adminOrdersKeys.list(q),
        queryFn: ({ pageParam, signal }) =>
            fetchAdminOrdersPage({
                cursor: (pageParam as string | null) ?? null,
                limit: 15,
                q,
                signal,
            }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        initialPageParam: null,
    });

    const orders: OrderListItem[] = React.useMemo(
        () =>
            data?.pages.flatMap((p) =>
                p.orders.map((o) => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    status: o.status,
                    createdAt: o.createdAt,
                    customer: o.customer,
                    caseDesign: o.caseDesign,
                }))
            ) ?? [],
        [data]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search order #, customer name, or email…"
                    className="w-full max-w-sm"
                />
                <Button onClick={() => refetch()} variant="outline">
                    Search
                </Button>
            </div>

            {isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {(error as Error)?.message ?? "Failed to load customers."}
                </div>
            )}
            <OrdersTable
                rows={orders}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
            />
        </div>
    );
}
