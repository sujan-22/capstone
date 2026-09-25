"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    adminCustomersKeys,
    type CustomersPage,
    fetchAdminCustomersPage,
} from "../actions/actions";
import { CustomersTable } from "./customers";
import { useUserRoleMutations } from "@/hooks/use-toggle-role";
import { IUser } from "../../../../../../auth-client";
import { CustomersItem } from "@/app/api/admin/customers/get-all/route";
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchField } from "../../components/controls";

export default function CustomersOverview({ user }: { user: IUser }) {
    const [q, setQ] = React.useState<string>("");
    const query = useDebounce(q.trim(), 300);
    const { setUserRole } = useUserRoleMutations();

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<CustomersPage>({
        queryKey: adminCustomersKeys.list(query),
        queryFn: ({ pageParam, signal }) =>
            fetchAdminCustomersPage({
                cursor: (pageParam as string | null) ?? null,
                limit: ADMIN_DATA_PAGE_SIZE,
                q: query,
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
                    username: c.username,
                }))
            ) ?? [],
        [data]
    );

    return (
        <div className="space-y-5">
            <SearchField
                value={q}
                onChange={setQ}
                label="Search customers"
                placeholder="Name, username or email…"
            />

            {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
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
