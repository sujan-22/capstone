"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByUser } from "../actions/actions";
import OrderOverview from "./orders-overview";
import ErrorMessage from "@/components/utilities/error";
import OrderCardSkeleton from "./skeleton/order-skeleton";
import AccountHeader from "../../components/account-header";

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
            return Array.from({ length: 3 }).map((_, i) => (
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

        return <OrderOverview orders={orders} userId={userId} />;
    };

    return (
        <div>
            <AccountHeader
                heading="Orders"
                description="Every case you've ordered, with its status, receipt and delivery details."
                aside={
                    orders.length ? (
                        <span className="type-label text-ink-soft">
                            {orders.length} {orders.length === 1 ? "order" : "orders"}
                        </span>
                    ) : null
                }
            />

            <section className="flex flex-col">{renderContent()}</section>
        </div>
    );
};

export default OrdersPage;
