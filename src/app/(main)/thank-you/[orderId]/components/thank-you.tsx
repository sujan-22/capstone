"use client";

import { getOrderById } from "@/app/order-details/[orderId]/actions/actions";
import ErrorMessage from "@/components/utilities/error";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import OrderConfirmation from "./order-confirmation";
import { IUser } from "../../../../../../auth-client";
import { notFound, useRouter } from "next/navigation";
import OrderConfirmationSkeleton from "./order-confirmation-skeleton";
import { Button } from "@/components/ui/button";

const ThankyouComponent = ({
    user,
    orderId,
}: {
    user: IUser;
    orderId: string;
}) => {
    const router = useRouter();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-order-confirmation", orderId],
        queryFn: async () => await getOrderById(user.id, orderId),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <OrderConfirmationSkeleton />;

    if (isError) {
        return (
            <div className="flex justify-center items-center mt-auto min-h-[80vh]">
                <ErrorMessage
                    message="There was an error from our end. Please try again later!"
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    if (data?.status === 403) {
        return (
            <div className="flex flex-col justify-center items-center mt-auto min-h-[80vh] text-center px-4">
                <h2 className="text-2xl font-semibold mb-3">
                    Payment Not Received
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    We couldn’t process your payment for this order. Don’t
                    worry, your design has been automatically saved! You can
                    review it on your{" "}
                    <span className="font-medium text-primary">
                        Unfinished Designs
                    </span>{" "}
                    page and try again when you’re ready.
                </p>
                <Button
                    onClick={() => router.push("/account/unfinished-designs")}
                >
                    Go to Unfinished Designs
                </Button>
            </div>
        );
    }

    if (!data?.order) return notFound();

    return <OrderConfirmation order={data.order} />;
};

export default ThankyouComponent;
