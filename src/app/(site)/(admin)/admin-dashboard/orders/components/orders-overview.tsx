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
import { useRouter, useSearchParams } from "next/navigation";
import { MdClear, MdSearch } from "react-icons/md";
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";

export default function OrdersOverview({}: { user: IUser }) {
    const [q, setQ] = React.useState<string>("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") ?? undefined;
    const filteredCustomerName = searchParams.get("userName") ?? undefined;

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
        queryKey: adminOrdersKeys.list(q, userId),
        queryFn: ({ pageParam, signal }) =>
            fetchAdminOrdersPage({
                cursor: (pageParam as string | null) ?? null,
                limit: ADMIN_DATA_PAGE_SIZE,
                q,
                userId,
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

    const clearUserFilter = () => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete("userId");
        sp.delete("userName");
        router.push(`/admin-dashboard/orders?${sp.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                        userId
                            ? "Searching within this customer’s orders…"
                            : "Search order #, customer name, or email…"
                    }
                    className="w-full max-w-sm"
                />
                <div className="flex gap-2">
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        icon={MdSearch}
                    >
                        Search
                    </Button>
                    {userId && (
                        <Button
                            variant="secondary"
                            onClick={clearUserFilter}
                            icon={MdClear}
                        >
                            Clear customer filter
                        </Button>
                    )}
                </div>
            </div>

            {userId && filteredCustomerName && (
                <div className="text-sm text-muted-foreground">
                    Filtering by{" "}
                    <span className="font-medium">
                        customer: {filteredCustomerName}
                    </span>
                </div>
            )}

            {isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {(error as Error)?.message ?? "Failed to load orders."}
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
