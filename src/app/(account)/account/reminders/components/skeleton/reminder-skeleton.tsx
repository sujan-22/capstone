"use client";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import Phone from "@/components/utilities/phone";

const ReminderSkeleton = () => {
    return (
        <div className="border rounded-lg p-3 flex flex-col sm:flex-row gap-3 bg-white shadow-sm">
            <div className="flex-shrink-0 w-24 h-auto relative rounded-md bg-muted overflow-hidden flex items-center justify-center">
                <Phone imgSrc="" altText="phone skeleton" />
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full rounded" />
                        ))}
                    </div>
                    <Skeleton className="h-4 w-1/2 rounded mt-1" />
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-full sm:w-24 rounded-md" />
                    <Skeleton className="h-8 w-full sm:w-40 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default ReminderSkeleton;
