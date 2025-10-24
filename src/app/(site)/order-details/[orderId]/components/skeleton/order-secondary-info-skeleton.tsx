"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OrderSecondaryInfoSkeleton: React.FC = () => {
    return (
        <div className="flex-1 w-full flex flex-col gap-4">
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-40 rounded mb-4" />

                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-y-1 gap-x-3 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <React.Fragment key={i}>
                            <dt className="text-muted-foreground">
                                <Skeleton className="h-4 w-24 rounded" />
                            </dt>
                            <dd className="text-right">
                                <Skeleton className="h-4 w-full rounded" />
                            </dd>
                        </React.Fragment>
                    ))}
                </dl>
            </section>

            {/* Billing & Shipping */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-56 rounded mb-4" />

                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                    {/* Billing */}
                    <div className="flex-1 text-left">
                        <Skeleton className="h-5 w-36 rounded mb-2" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                            <Skeleton className="h-4 w-4/6 rounded" />
                            <Skeleton className="h-4 w-4/6 rounded" />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="flex-1 text-left md:text-center">
                        <Skeleton className="h-5 w-32 rounded mb-2" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                            <Skeleton className="h-4 w-4/6 rounded" />
                            <Skeleton className="h-4 w-4/6 rounded" />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="flex-1 text-left md:text-right">
                        <Skeleton className="h-5 w-24 rounded mb-2" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                            <Skeleton className="h-4 w-4/6 rounded" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Summary */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-44 rounded mb-4" />

                <dl className="grid grid-cols-2 gap-x-4 text-sm gap-y-1 sm:text-base">
                    <dt className="text-muted-foreground">
                        <Skeleton className="h-4 w-24 rounded" />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-24 rounded ml-auto" />
                    </dd>

                    <dt className="text-muted-foreground">
                        <Skeleton className="h-4 w-24 rounded" />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-12 rounded ml-auto" />
                    </dd>

                    <dt className="text-muted-foreground">
                        <Skeleton className="h-4 w-24 rounded" />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-20 rounded ml-auto" />
                    </dd>
                </dl>

                <hr className="border-muted-foreground/50 my-3" />

                <dl className="grid grid-cols-2 gap-x-4 text-sm sm:text-base">
                    <dt className="font-semibold">
                        <Skeleton className="h-5 w-28 rounded" />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-6 w-24 rounded ml-auto" />
                    </dd>
                </dl>
            </section>
        </div>
    );
};

export default OrderSecondaryInfoSkeleton;
