"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../actions/actions";
import ErrorMessage from "@/components/utilities/error";
import LoadingMessage from "@/components/utilities/loading";
import Order from "./order";
import { IUser } from "../../../../../auth-client";

const OrderDetailsPage = ({
    user,
    orderId,
}: {
    user: IUser;
    orderId: string;
}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-order-by-id"],
        queryFn: async () => await getOrderById(user.id, orderId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <LoadingMessage message="Loading order details..." size={24} />;
    }

    if (isError)
        return (
            <ErrorMessage
                message="Failed to load order details."
                onRetry={() => refetch()}
            />
        );

    const order = data?.order;

    if (!order)
        return <ErrorMessage message="No order found with the provided ID." />;

    return <Order order={order} user={user} />;
};

export default OrderDetailsPage;
