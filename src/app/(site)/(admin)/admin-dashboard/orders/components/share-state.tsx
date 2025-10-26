"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function RequestBadge() {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Badge
                        variant={"outline"}
                        className="border border-blue-500 text-blue-600 dark:text-blue-500"
                    >
                        Request
                    </Badge>
                </DialogTrigger>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle hidden>
                            Request to share design
                        </DialogTitle>
                        <DialogDescription>
                            Customer requested to add this design to the public
                            library
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">
                    <Badge
                        variant={"outline"}
                        className="border border-blue-500 text-blue-600 dark:text-blue-500"
                    >
                        Request
                    </Badge>
                </span>
            </TooltipTrigger>
            <TooltipContent>
                Customer requested to add this design to the public library
            </TooltipContent>
        </Tooltip>
    );
}
