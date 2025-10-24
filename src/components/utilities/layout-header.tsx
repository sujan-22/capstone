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
            <div className="space-y-0.5">
                <h2 className="text-2xl font-semibold">{heading}</h2>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>

            <Separator className="my-6" />
            {children}
        </div>
    );
};

export default LayoutHeader;
