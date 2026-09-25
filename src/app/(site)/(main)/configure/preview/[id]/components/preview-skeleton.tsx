"use client";

import React from "react";
import Phone from "@/components/utilities/phone";
import PreviewInfoSkeleton from "./preview-info-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const PreviewSkeleton: React.FC = () => {
    return (
        <div
            aria-busy="true"
            aria-label="Loading your proof"
            className="grid gap-12 lg:grid-cols-12 lg:gap-10"
        >
            <div className="lg:col-span-7">
                <div className="mx-auto flex aspect-[5/6] w-full max-w-[520px] items-center justify-center bg-paper-raised">
                    <div className="w-[200px] animate-pulse opacity-70 sm:w-[250px]">
                        <Phone imgSrc="" sizes="250px" />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-5 h-14 w-4/5" />
                <Skeleton className="mt-5 h-5 w-full" />
                <Skeleton className="mt-2 h-5 w-2/3" />
                <div className="mt-10">
                    <PreviewInfoSkeleton />
                </div>
                <div className="mt-8 flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-full" />
                    <Skeleton className="h-12 flex-[1.4] rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default PreviewSkeleton;
