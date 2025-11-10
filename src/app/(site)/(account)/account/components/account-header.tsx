import { Separator } from "@/components/ui/separator";
import * as React from "react";

type Props = {
    heading: string;
    description?: string;
    icon: React.ElementType;
};

const AccountHeader: React.FC<Props> = ({
    heading,
    description,
    icon: Icon,
}) => {
    return (
        <header className="space-y-3">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        {heading}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <Separator />
        </header>
    );
};

export default AccountHeader;
