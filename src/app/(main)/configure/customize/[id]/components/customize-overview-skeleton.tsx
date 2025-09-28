"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Phone from "@/components/utilities/phone";
import React from "react";

const CustomizeOverviewSkeleton = () => {
    return (
        <div className="relative h-[70vh] mt-3 grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Left: Canvas Editor skeleton */}
            <div className="col-span-2 rounded-lg bg-secondary border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="relative w-60 aspect-[896/1831] flex items-center justify-center">
                    <Phone imgSrc="" altText="phone skeleton" />
                </div>
            </div>

            {/* Right: Customization panel skeleton */}
            <div className="h-[70vh] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
                <div className="flex-1 px-8 pb-12">
                    {/* Heading */}
                    <Skeleton className="h-7 w-full mb-2" />
                    <Skeleton className="h-7 w-1/4 mb-6" />
                    <Separator />

                    {/* Options */}
                    <div className="flex mt-6 flex-col gap-8">
                        <div>
                            <Skeleton className="h-4 w-40 mb-3" />
                            <div className="flex gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-8 w-8 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Model selector */}
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>

                        {/* Material options */}
                        <div className="flex flex-col gap-3">
                            <Skeleton className="h-4 w-20" />
                            <div className="rounded-lg bg-white px-6 py-4 shadow-sm border-2 w-full h-auto">
                                <div className="flex justify-between">
                                    <Skeleton className="h-[18px] w-2/4" />
                                    <Skeleton className="h-[18px] w-1/4" />
                                </div>
                                <Skeleton className="mt-2 h-[18px] w-full" />
                                <Skeleton className="mt-2 h-[18px] w-1/4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full px-8">
                    <div className="h-px w-full bg-zinc-200" />
                    <div className="flex gap-6 items-center justify-end my-3">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeOverviewSkeleton;
