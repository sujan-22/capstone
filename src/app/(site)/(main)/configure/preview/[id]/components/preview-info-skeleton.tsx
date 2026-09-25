import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PreviewInfoSkeleton = () => {
    return (
        <div className="flex w-full flex-col gap-8">
            <div>
                <Skeleton className="mb-3 h-3 w-40" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex justify-between border-b border-rule py-3.5"
                    >
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-44 rounded-full" />
                <Skeleton className="h-8 w-36 rounded-full" />
            </div>
            <div className="space-y-3 bg-paper-raised px-6 py-7">
                <Skeleton className="mx-auto h-3 w-28" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
                <div className="flex justify-between border-t border-rule pt-4">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
    );
};

export default PreviewInfoSkeleton;
