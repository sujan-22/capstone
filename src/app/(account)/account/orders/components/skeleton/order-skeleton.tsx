"use client";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import Phone from "@/components/utilities/phone";

const OrderCardSkeleton = () => {
    return (
        <div className="flex flex-col text-sm w-full max-w-full">
            <div className="flex flex-col text-muted-foreground text-xs sm:text-sm gap-y-2 mb-2">
                <div className="flex flex-wrap items-center gap-x-2">
                    <Skeleton className="h-4 w-1/6 rounded" />
                    <Skeleton className="h-4 w-2/4 rounded" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4">
                    <Skeleton className="h-4 w-1/4 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                </div>
            </div>

            <div className="w-full h-full mt-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-44 h-auto rounded-md bg-muted overflow-hidden flex items-center justify-center">
                            <Phone imgSrc="" altText="phone skeleton" />
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-sm mt-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <Skeleton className="h-4 w-16 rounded" />
                                    <Skeleton className="h-4 w-full rounded" />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
                <Skeleton className="h-8 w-full sm:w-24 rounded-md" />
                <Skeleton className="h-8 w-full sm:w-24 rounded-md" />
            </div>
        </div>
    );
};

export default OrderCardSkeleton;
