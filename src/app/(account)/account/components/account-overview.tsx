"use client";

import React from "react";
import { ISession, IUser } from "../../../../../auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";

interface AccountOverviewProps {
    user: IUser | undefined;
    session: ISession | null;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ user, session }) => {
    const memberSince = user?.createdAt;
    const lastLogin = session?.createdAt;
    const ordersPlaced = 5;
    const favoriteDesigns = 12;
    const { signOut } = useSignOut();

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg mb-2">Recent Activity</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Last login: {formatDate(lastLogin)}</li>
                        <li>Orders placed: {ordersPlaced}</li>
                        <li>Favorite designs: {favoriteDesigns}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AccountOverview;
