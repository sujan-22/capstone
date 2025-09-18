import { Skeleton } from "@/components/ui/skeleton";
import Phone from "@/components/utilities/phone";
import React from "react";

const CaseDesignSkeleton = () => {
    return (
        <article className="w-full p-1">
            <Phone imgSrc="" className="mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm mb-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex justify-between gap-2">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
        </article>
    );
};

export default CaseDesignSkeleton;
