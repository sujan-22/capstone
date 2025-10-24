"use client";

import React from "react";
import Phone from "@/components/utilities/phone";
import PreviewInfoSkeleton from "./preview-info-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const PreviewSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 mt-3 w-full">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto md:mx-0 flex items-center justify-center">
                    <div className="relative sm:w-48 w-56 h-auto lg:w-64 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        <Phone imgSrc="" altText="phone skeleton" />
                    </div>
                </div>

                <PreviewInfoSkeleton />
            </div>
            <div className="w-full">
                <div className="flex gap-6 items-center justify-end my-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-28" />
                </div>
            </div>
        </div>
    );
};

export default PreviewSkeleton;
