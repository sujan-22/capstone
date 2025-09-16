"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByUser } from "../actions/actions";
import OrderOverview from "./orders-overview";
import LoadingMessage from "@/components/utilities/loading";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const OrdersPage = ({ userId }: { userId: string }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-orders"],
        queryFn: async () => await getOrdersByUser(userId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <LoadingMessage message="Loading orders..." size={24} />;
    }

    if (isError)
        return (
            <ErrorMessage
                message="Failed to load orders."
                onRetry={() => refetch()}
            />
        );
    const orders = data?.orders;

    if (!orders?.length)
        return (
            <div
                className="w-full flex flex-col items-center gap-y-4"
                data-testid="no-orders-container"
            >
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
        );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg">Orders</h3>
                <p className="text-sm text-muted-foreground">
                    View your previous orders and their status.
                </p>
            </div>

            <Separator />
            <OrderOverview orders={orders} />
        </div>
    );
};

export default OrdersPage;
