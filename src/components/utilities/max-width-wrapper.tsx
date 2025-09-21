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
                "max-w-[1200px] mx-auto h-full px-7 md:px-24 lg:px-24 xl:px-24",
                className
            )}
        >
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
