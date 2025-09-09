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
                "max-w-[1400px] mx-auto h-full px-3 sm:px-2 lg:px-24",
                className
            )}
        >
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
