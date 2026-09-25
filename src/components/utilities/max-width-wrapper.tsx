import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div
            className={cn(
                "mx-auto h-full w-full max-w-[1360px] px-4 sm:px-6 lg:px-10",
                className
            )}
        >
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
