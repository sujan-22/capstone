import { Skeleton } from "@/components/ui/skeleton";
import Phone from "@/components/utilities/phone";
import React from "react";
import { cn } from "@/lib/utils";

const CaseDesignSkeleton = ({ isDark }: { isDark?: boolean }) => {
    const bar = isDark ? "bg-paper/10" : undefined;

    return (
        <article aria-hidden className="flex flex-col">
            <div
                className={cn(
                    "flex justify-center rounded-md px-10 pb-9 pt-12",
                    isDark
                        ? "bg-ink-raised ring-1 ring-paper/10"
                        : "bg-paper-sunken"
                )}
            >
                <div className="w-[54%] max-w-[190px] animate-pulse opacity-60">
                    <Phone imgSrc="" dark={isDark} sizes="190px" />
                </div>
            </div>
            <div className="mt-5 flex justify-between gap-6">
                <Skeleton className={cn("h-5 w-2/3", bar)} />
                <Skeleton className={cn("h-5 w-16", bar)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className={cn("h-4", bar)} />
                ))}
            </div>
            <div className="mt-5 flex gap-2">
                <Skeleton className={cn("h-9 flex-1 rounded-full", bar)} />
                <Skeleton className={cn("h-9 w-20 rounded-full", bar)} />
            </div>
        </article>
    );
};

export default CaseDesignSkeleton;
