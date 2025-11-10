"use client";

import React from "react";
import { ISession, IUser } from "../../../../../../auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AccountOverviewProps {
    user: IUser;
    session: ISession;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ user, session }) => {
    const router = useRouter();
    const lastLogin = session?.createdAt;
    const { signOut } = useSignOut();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-user-info", user.id],
        queryFn: async () => await getUserInfo(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="relative inline-flex w-8 h-8 rounded-full ring-1 ring-border overflow-hidden">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt=""
                                fill
                                sizes="32px"
                                priority
                                referrerPolicy="no-referrer"
                                className="object-cover"
                            />
                        ) : (
                            <span
                                aria-hidden
                                className="flex w-full h-full items-center justify-center text-[11px] font-semibold bg-muted text-muted-foreground"
                            >
                                {getInitials(user)}
                            </span>
                        )}
                    </span>
                    <div>
                        <h3 className="text-xl font-semibold leading-tight">
                            Welcome back{user?.name ? `, ${user.name}` : ""}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {user.email} • Member since{" "}
                            {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/account/orders")}
                    >
                        View Orders
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => user && (await signOut())}
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
            <Separator />
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    <div className="gap-y-1 flex flex-col">
                        <Skeleton className="h-6 w-1/2 mb-3 rounded" />
                        <Skeleton className="h-4 w-2/3 mb-1 rounded" />
                        <Skeleton className="h-4 w-1/3 mb-1 rounded" />
                        <Skeleton className="h-4 w-1/2 mb-1 rounded" />
                    </div>
                </div>
            )}
            {!isLoading && (isError || !data?.success || !data.user) && (
                <div className="flex items-center gap-2">
                    <p className="text-sm sm:text-base">
                        Failed to load account details.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                    >
                        Retry
                    </Button>
                </div>
            )}
            {!isLoading && data?.success && data.user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-lg mb-2">Recent Activity</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>Last login: {formatDate(lastLogin)}</li>
                            <li>Orders placed: {data.user.totalOrders}</li>
                            <li>
                                Favorite designs:{" "}
                                {data.user.favoriteDesignsCount}
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountOverview;
