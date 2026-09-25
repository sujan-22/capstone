"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Phone from "@/components/utilities/phone";
import React from "react";

const CustomizeOverviewSkeleton = () => {
    return (
        <div
            aria-busy="true"
            aria-label="Loading your design"
            className="grid overflow-hidden rounded-lg border border-rule bg-paper-raised lg:grid-cols-[minmax(0,1fr)_400px]"
        >
            <div className="cutting-mat flex h-[clamp(480px,calc(100dvh-15rem),820px)] items-center justify-center">
                <div className="aspect-[896/1831] h-[80%] animate-pulse opacity-70">
                    <Phone imgSrc="" sizes="320px" />
                </div>
            </div>

            <div className="flex flex-col border-t border-rule lg:h-[clamp(480px,calc(100dvh-15rem),820px)] lg:border-l lg:border-t-0">
                <div className="border-b border-rule px-6 py-5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-7 w-3/4" />
                </div>
                <div className="flex-1 space-y-8 px-6 py-6">
                    <div>
                        <Skeleton className="mb-4 h-4 w-24" />
                        <div className="flex gap-2.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="size-11 rounded-full" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Skeleton className="mb-4 h-4 w-20" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <div>
                        <Skeleton className="mb-4 h-4 w-24" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="mt-2 h-16 w-full rounded-lg" />
                    </div>
                </div>
                <div className="border-t border-rule px-6 py-5">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="mt-5 h-12 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default CustomizeOverviewSkeleton;
