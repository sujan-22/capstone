"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OrderSkeleton: React.FC = () => {
    return (
        <div aria-busy="true" aria-label="Loading your order" className="flex w-full flex-col gap-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="mt-3 h-8 w-64" />
                    <Skeleton className="mt-3 h-5 w-52" />
                </div>
                <div className="grid grid-cols-3 gap-2 lg:col-span-7">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-8" />
                    ))}
                </div>
            </div>
            <div className="grid gap-10 lg:grid-cols-12">
                <Skeleton className="aspect-[3000/2001] w-full lg:col-span-7" />
                <div className="space-y-4 lg:col-span-5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-8 w-3/4" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10" />
                    ))}
                </div>
            </div>
            <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 rounded-none" />
                ))}
            </div>
        </div>
    );
};

export default OrderSkeleton;
