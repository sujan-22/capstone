"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IUser } from "../../../../../../auth-client";
import {
    adminOrdersKeys,
    fetchAdminOrdersPage,
    OrderListItem,
    OrdersPage,
} from "../actions/actions";
import { OrdersTable } from "./orders";
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchField, Segmented } from "../../components/controls";

type StatusFilter = "ALL" | "PENDING" | "SHIPPED" | "FULFILLED";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "FULFILLED", label: "Fulfilled" },
];

export default function OrdersOverview({}: { user: IUser }) {
    const [q, setQ] = React.useState<string>("");
    const [status, setStatus] = React.useState<StatusFilter>("ALL");
    const query = useDebounce(q.trim(), 300);
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") ?? undefined;
    const filteredCustomerName = searchParams.get("userName") ?? undefined;
    const statusParam = status === "ALL" ? undefined : status;

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<OrdersPage>({
        queryKey: adminOrdersKeys.list(query, userId, statusParam),
        queryFn: ({ pageParam, signal }) =>
            fetchAdminOrdersPage({
                cursor: (pageParam as string | null) ?? null,
                limit: ADMIN_DATA_PAGE_SIZE,
                q: query,
                userId,
                status: statusParam,
                signal,
            }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        initialPageParam: null,
    });

    const orders: OrderListItem[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.orders) ?? [],
        [data]
    );

    const clearUserFilter = () => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete("userId");
        sp.delete("userName");
        router.push(`/admin-dashboard/orders?${sp.toString()}`);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Segmented
                    label="Filter by status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={setStatus}
                />
                <SearchField
                    value={q}
                    onChange={setQ}
                    label="Search orders"
                    placeholder={
                        userId
                            ? "Search this customer's orders…"
                            : "Order #, customer name or email…"
                    }
                />
            </div>

            {userId && filteredCustomerName && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-ink-soft">Showing orders from</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink py-1 pl-3 pr-1 text-paper">
                        {filteredCustomerName}
                        <button
                            type="button"
                            onClick={clearUserFilter}
                            className="flex size-5 items-center justify-center rounded-full hover:bg-paper/15"
                        >
                            <X aria-hidden className="size-3" />
                            <span className="sr-only">Clear customer filter</span>
                        </button>
                    </span>
                </div>
            )}

            {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
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
