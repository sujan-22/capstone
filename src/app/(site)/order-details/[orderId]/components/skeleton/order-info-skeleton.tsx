"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OrderInfoSkeleton: React.FC = () => {
    return (
        <div className="text-sm w-full bg-muted px-4 py-2.5 rounded-md">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-56 rounded" />
                </div>

                <div className="mt-2">
                    <Skeleton className="h-5 w-64 rounded" />
                </div>

                <div className="flex items-center gap-x-4 mt-2">
                    <Skeleton className="h-5 w-28 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                </div>
            </div>
        </div>
    );
};

export default OrderInfoSkeleton;
