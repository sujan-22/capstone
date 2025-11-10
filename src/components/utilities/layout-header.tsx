import React from "react";
import { Separator } from "../ui/separator";

const LayoutHeader = ({
    children,
    heading,
    description,
}: {
    children: React.ReactNode;
    heading: string;
    description: string;
}) => {
    return (
        <div className="space-y-6 p-10 px-0 pb-16">
            <div className="relative pl-6">
                <span className="pointer-events-none absolute inset-y-0 left-0 w-[6px] rounded-full bg-blue-600" />
                <h2 className="text-2xl font-semibold">{heading}</h2>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>

            <Separator className="my-6" />
            {children}
        </div>
    );
};

export default LayoutHeader;
