"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    CardAction,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { cn } from "@/lib/utils";

export function DashboardStatSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn("h-full", className)}>
            <CardHeader>
                <CardDescription>
                    <Skeleton className="h-4 w-28 rounded" />
                </CardDescription>

                <CardTitle className="mt-1">
                    <Skeleton className="h-8 w-40 rounded" />
                </CardTitle>

                <CardAction>
                    <Skeleton className="h-6 w-18 rounded-xl" />
                </CardAction>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-2 text-sm">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
            </CardFooter>
        </Card>
    );
}

export function DashboardStatsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <DashboardStatSkeleton key={i} />
            ))}
        </div>
    );
}
