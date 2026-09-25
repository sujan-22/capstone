"use client";

import { Skeleton } from "@/components/ui/skeleton";

const OrderConfirmationSkeleton = () => {
    return (
        <div aria-busy="true" aria-label="Loading your order" className="pb-20 pt-8 sm:pt-12">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-6">
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="mt-6 h-20 w-4/5" />
                    <Skeleton className="mt-6 h-5 w-full" />
                    <Skeleton className="mt-2 h-5 w-2/3" />
                    <Skeleton className="mt-8 h-20 w-64" />
                    <div className="mt-8 flex gap-3">
                        <Skeleton className="h-12 w-48 rounded-full" />
                        <Skeleton className="h-12 w-44 rounded-full" />
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <Skeleton className="aspect-[3000/2001] w-full" />
                </div>
            </div>
            <div className="mt-16 border-t border-rule pt-10">
                <Skeleton className="h-7 w-40" />
                <div className="mt-8 grid gap-px md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-none" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationSkeleton;
