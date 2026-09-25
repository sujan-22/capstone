"use client";

import { getOrderById } from "@/app/(site)/order-details/[orderId]/actions/actions";
import ErrorMessage from "@/components/utilities/error";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import OrderConfirmation from "./order-confirmation";
import { IUser } from "../../../../../../../auth-client";
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
            <div className="flex min-h-[70vh] items-center justify-center">
                <ErrorMessage
                    message="There was an error from our end. Please try again later!"
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    if (data?.status === 403) {
        return (
            <div className="flex min-h-[70vh] flex-col items-start justify-center py-16">
                <p className="type-label text-destructive">
                    Payment not received
                </p>
                <h1 className="type-display mt-5 max-w-[14ch] !text-[clamp(2.5rem,5vw,4.5rem)]">
                    We couldn&rsquo;t take payment for this order.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                    Don&rsquo;t worry, your design has been saved
                    automatically. You&rsquo;ll find it in your{" "}
                    <span className="font-semibold text-ink">
                        Unfinished Designs
                    </span>
                    , ready to try again whenever you are.
                </p>
                <Button
                    size="lg"
                    className="mt-8"
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
