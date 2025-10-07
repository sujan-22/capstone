import { Skeleton } from "@/components/ui/skeleton";
import Phone from "@/components/utilities/phone";
import React from "react";
import { cn } from "@/lib/utils";

const CaseDesignSkeleton = ({ isDark }: { isDark?: boolean }) => {
    return (
        <article className="w-full p-1">
            <Phone imgSrc="" className="mb-4" dark={isDark} />

            <Skeleton
                className={cn("h-6 w-full mb-4", isDark && "bg-secondary/50")}
            />

            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className={cn(
                            "h-4",
                            i % 2 === 0 ? "w-12" : "w-full",
                            isDark && "bg-secondary/50"
                        )}
                    />
                ))}
            </div>

            <div className="flex justify-between gap-2">
                <Skeleton
                    className={cn(
                        "h-8 w-18 rounded-md",
                        isDark && "bg-secondary/50"
                    )}
                />
                <Skeleton
                    className={cn(
                        "h-8 w-18 rounded-md",
                        isDark && "bg-secondary/50"
                    )}
                />
            </div>
        </article>
    );
};

export default CaseDesignSkeleton;
