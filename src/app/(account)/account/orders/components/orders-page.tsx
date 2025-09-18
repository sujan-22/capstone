"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByUser } from "../actions/actions";
import OrderOverview from "./orders-overview";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrderCardSkeleton from "./skeleton/order-skeleton";

interface OrdersPageProps {
    userId: string;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ userId }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-orders", userId],
        queryFn: async () => await getOrdersByUser(userId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });

    const orders = data?.orders ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg">Orders</h3>
                <p className="text-sm text-muted-foreground">
                    View your previous orders and their status.
                </p>
            </div>

            <Separator />
            {isLoading && (
                <section className="flex flex-col gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-y-6 sm:gap-y-8 w-full"
                        >
                            <OrderCardSkeleton />
                            <Separator />
                        </div>
                    ))}
                </section>
            )}
            {isError && (
                <ErrorMessage
                    message="Failed to load orders."
                    onRetry={() => refetch()}
                />
            )}
            {!isLoading && !isError && orders.length === 0 && (
                <div className="w-full flex flex-col items-center gap-y-4">
                    <h2 className="text-large-semi">Nothing to see here</h2>
                    <p className="text-base-regular">
                        You don&apos;t have any orders yet, let us change that{" "}
                        {":)"}
                    </p>
                    <div className="mt-4">
                        <Link href="/" passHref>
                            <Button>Continue shopping</Button>
                        </Link>
                    </div>
                </div>
            )}
            {!isLoading && !isError && orders.length > 0 && (
                <OrderOverview orders={orders} />
            )}
        </div>
    );
};

export default OrdersPage;
