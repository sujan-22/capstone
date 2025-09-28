"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import CustomImage from "@/components/utilities/custom-image";

const OrderConfirmationSkeleton = () => {
    return (
        <div className="py-16">
            {/* Header */}
            <div className="max-w-xl space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-fll" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-10 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>

            {/* Message */}
            <div className="mt-10 border-t border-zinc-200 pt-10 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/5" />
            </div>

            {/* Phone preview skeleton */}
            <div className="flex space-x-6 overflow-hidden mt-6 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl">
                <AspectRatio ratio={3000 / 2001} className="relative w-full">
                    <div className="relative h-full w-full z-40">
                        <CustomImage
                            alt="phone"
                            src="/assets/phone-template/clearphone.png"
                            className="pointer-events-none h-full w-full rounded-md"
                        />
                    </div>
                </AspectRatio>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                <div className="space-y-2">
                    <Skeleton className="h-4 mb-3.5 w-28" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 mb-3.5 w-28" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>

            {/* Payment + Shipping method */}
            <div className="grid grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm">
                <div className="space-y-2">
                    <Skeleton className="h-4 mb-3.5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 mb-3.5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>

            {/* Pricing summary */}
            <div className="space-y-3 border-t border-zinc-200 pt-10 text-sm">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationSkeleton;
