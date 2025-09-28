"use client";

import { getOrderById } from "@/app/order-details/[orderId]/actions/actions";
import ErrorMessage from "@/components/utilities/error";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import OrderConfirmation from "./order-confirmation";
import { IUser } from "../../../../../../auth-client";
import { notFound } from "next/navigation";
import OrderConfirmationSkeleton from "./order-confirmation-skeleton";

const ThankyouComponent = ({
    user,
    orderId,
}: {
    user: IUser;
    orderId: string;
}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-order-confirmation"],
        queryFn: async () => await getOrderById(user.id, orderId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <OrderConfirmationSkeleton />;
    }

    if (isError)
        return (
            <div className="flex justify-center items-center mt-auto min-h-[80vh]">
                <ErrorMessage
                    message="There was an error from our end. Please try again later!"
                    onRetry={() => refetch()}
                />
            </div>
        );

    const order = data?.order;

    if (!order) return notFound();

    return <OrderConfirmation order={order} />;
};

export default ThankyouComponent;
