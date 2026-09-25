"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div
            aria-hidden
            className="grid overflow-hidden rounded-md border border-rule bg-paper-raised sm:grid-cols-3"
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={
                        i > 0 ? "border-t border-rule p-6 sm:border-l sm:border-t-0" : "p-6"
                    }
                >
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="mt-5 h-10 w-36" />
                    <Skeleton className="mt-3 h-4 w-44" />
                </div>
            ))}
        </div>
    );
}
