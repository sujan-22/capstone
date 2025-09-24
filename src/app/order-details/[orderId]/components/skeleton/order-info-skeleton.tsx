"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OrderInfoSkeleton: React.FC = () => {
    return (
        <div className="text-sm w-full">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-56 rounded" />
                </div>

                <div className="mt-2">
                    <Skeleton className="h-5 w-64 rounded" />
                </div>

                <div className="flex items-center gap-x-4 mt-3">
                    <Skeleton className="h-5 w-28 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                </div>
            </div>
        </div>
    );
};

export default OrderInfoSkeleton;
