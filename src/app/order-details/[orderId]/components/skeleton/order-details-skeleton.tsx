"use client";

import React from "react";
import Phone from "@/components/utilities/phone";
import { Skeleton } from "@/components/ui/skeleton";
import OrderInfoSkeleton from "./order-info-skeleton";
import OrderSecondaryInfoSkeleton from "./order-secondary-info-skeleton";

const OrderSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 my-10 w-full">
            <Skeleton className="h-7 w-48 rounded" />
            <div className="w-full">
                <OrderInfoSkeleton />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto md:mx-0 flex items-center justify-center">
                    <div className="relative sm:w-48 w-56 h-auto lg:w-64 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        <Phone imgSrc="" altText="phone skeleton" />
                    </div>
                </div>

                <OrderSecondaryInfoSkeleton />
            </div>
        </div>
    );
};

export default OrderSkeleton;
