import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PreviewInfoSkeleton = () => {
    return (
        <div className="flex-1 w-full flex flex-col gap-4">
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-1/3  mb-4" />

                <div className="mt-2 grid gap-y-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div className="flex justify-between" key={i}>
                            <Skeleton className="h-4 w-1/4 " />
                            <Skeleton className="h-4 w-1/4 " />
                        </div>
                    ))}
                </div>
            </section>

            {/* Billing & Shipping */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-1/3  mb-4" />

                <div className="grid gap-1">
                    <Skeleton className="h-4 w-1/3 " />
                    <Skeleton className="h-4 w-1/5 " />
                    <Skeleton className="h-4 w-1/4 " />
                </div>
            </section>

            {/* Pricing Summary */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <Skeleton className="h-6 w-1/4  mb-4" />

                <dl className="grid grid-cols-2 gap-x-4 text-sm gap-y-1 sm:text-base">
                    <dt>
                        <Skeleton className="h-4 w-32 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-24  ml-auto" />
                    </dd>

                    <dt>
                        <Skeleton className="h-4 w-24 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-20  ml-auto" />
                    </dd>
                </dl>

                <Separator className="my-4" />

                <dl className="grid grid-cols-2 gap-x-4 text-sm gap-y-1 sm:text-base">
                    <dt>
                        <Skeleton className="h-4 w-24 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-12  ml-auto" />
                    </dd>

                    <dt>
                        <Skeleton className="h-4 w-24 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-12  ml-auto" />
                    </dd>

                    <dt>
                        <Skeleton className="h-4 w-24 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-4 w-20  ml-auto" />
                    </dd>
                </dl>

                <Separator className="my-4" />

                <dl className="grid grid-cols-2 gap-x-4 text-sm sm:text-base">
                    <dt>
                        <Skeleton className="h-5 w-28 " />
                    </dt>
                    <dd className="text-right">
                        <Skeleton className="h-5 w-24  ml-auto" />
                    </dd>
                </dl>
            </section>
        </div>
    );
};

export default PreviewInfoSkeleton;
