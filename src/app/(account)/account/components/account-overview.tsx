"use client";

import React from "react";
import { ISession, IUser } from "../../../../../auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../actions/actions";
import { ClipLoader } from "react-spinners";

interface AccountOverviewProps {
    user: IUser;
    session: ISession;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ user, session }) => {
    const memberSince = user?.createdAt;
    const lastLogin = session?.createdAt;
    const { signOut } = useSignOut();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-user-info", user.id],
        queryFn: async () => await getUserInfo(user.id),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl">
                        Welcome Back{user?.name ? `, ${user.name}` : ""}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Signed in as:{" "}
                        <span className="font-semibold">{user?.email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Member since:{" "}
                        <span className="font-semibold">
                            {formatDate(memberSince)}
                        </span>
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        if (user) {
                            await signOut();
                        }
                    }}
                    className="h-10 self-start"
                >
                    Sign Out
                </Button>
            </div>

            <Separator />

            {isLoading ? (
                <div className="flex items-center gap-2">
                    <ClipLoader size={24} />
                    <p className="text-sm sm:text-base">
                        Loading account details...
                    </p>
                </div>
            ) : isError || !data?.success || !data.user ? (
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
            ) : (
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
