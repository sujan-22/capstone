"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    adminCustomersKeys,
    type CustomersPage,
    fetchAdminCustomersPage,
} from "../actions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomersTable } from "./customers";
import { useUserRoleMutations } from "@/hooks/use-toggle-role";
import { IUser } from "../../../../../../../auth-client";
import { CustomersItem } from "@/app/api/admin/customers/get-all/route";

export default function CustomersOverview({ user }: { user: IUser }) {
    const [q, setQ] = React.useState<string>("");
    const { setUserRole } = useUserRoleMutations();

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery<CustomersPage>({
        queryKey: adminCustomersKeys.list(q),
        queryFn: ({ pageParam, signal }) =>
            fetchAdminCustomersPage({
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

    const customers: CustomersItem[] = React.useMemo(
        () =>
            data?.pages.flatMap((p) =>
                p.customers.map((c) => ({
                    id: c.id,
                    name: c.name,
                    email: c.email,
                    ordersCount: c.ordersCount,
                    revenue: c.revenue,
                    createdAt: c.createdAt,
                    lastOrderAt: c.lastOrderAt,
                    role: c.role,
                    banned: c.banned,
                    banReason: c.banReason,
                    banExpires: c.banExpires,
                    username: c.username
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
                    placeholder="Search name, username, or email…"
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
            <CustomersTable
                rows={customers}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleAdmin={async (id, makeAdmin) => {
                    await setUserRole({
                        userId: id,
                        role: makeAdmin ? "admin" : "user",
                    });
                }}
                currentUserId={user.id}
            />
        </div>
    );
}
