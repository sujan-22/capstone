"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByUser } from "../actions/actions";
import OrderOverview from "./orders-overview";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrderCardSkeleton from "./skeleton/order-skeleton";
import AccountHeader from "../../components/account-header";
import { ShoppingBag } from "lucide-react";

interface OrdersPageProps {
    userId: string;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ userId }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-orders", userId],
        queryFn: async () => await getOrdersByUser(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });

    const orders = data?.orders ?? [];

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 4 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
            ));
        }

        if (isError) {
            return (
                <ErrorMessage
                    message="Unable to load your orders."
                    onRetry={() => refetch()}
                />
            );
        }

        if (!data?.success) {
            return (
                <ErrorMessage
                    message={data?.error ?? "Unable to load your orders."}
                    onRetry={() => refetch()}
                />
            );
        }

        if (!orders.length) {
            return (
                <div className="w-full flex flex-col items-center gap-4 col-span-full text-center">
                    <h2 className="text-2xl font-semibold">No orders yet</h2>
                    <p className="text-base text-muted-foreground max-w-md">
                        You don&apos;t have any orders yet. Start shopping to
                        place your first order.
                    </p>
                    <Link href="/" passHref>
                        <Button className="mt-2">Continue shopping</Button>
                    </Link>
                </div>
            );
        }

        return <OrderOverview orders={orders} userId={userId} />;
    };

    return (
        <div className="space-y-6">
            <AccountHeader
                heading="Your Orders"
                description="View and manage your past orders, track status, and find
                    order details."
                icon={ShoppingBag}
            />

            <section className="flex flex-col gap-4">{renderContent()}</section>
        </div>
    );
};

export default OrdersPage;
