import { InfoIcon, BadgeCheckIcon, Share2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminOrdersInfo() {
    return (
        <div className="grid w-full items-start gap-3">
            {/* Status meanings */}
            <Alert>
                <InfoIcon />
                <AlertTitle>Order status</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <span className="font-medium">Pending: </span>
                            payment captured; awaiting fulfillment.
                        </li>
                        <li>
                            <span className="font-medium">Shipped: </span>handed
                            off to carrier.
                        </li>
                        <li>
                            <span className="font-medium">Fulfilled: </span>
                            order completed; no further changes expected.
                        </li>
                        <li>
                            You can update status from the badge menu in each
                            row.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Request / Shared badges */}
            <Alert>
                <Share2Icon />
                <AlertTitle>Design visibility badges</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <span className="font-medium">Request: </span>
                            customer asked to add this design to the public
                            gallery.
                        </li>
                        <li>
                            <span className="font-medium">Shared: </span>design
                            is already visible in the public gallery.
                        </li>
                        <li>Approve/deny from the actions dropdown.</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Actions / constraints */}
            <Alert>
                <BadgeCheckIcon />
                <AlertTitle>Actions & rules</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Use{" "}
                            <span className="font-medium">… → View order</span>{" "}
                            for full details, address, and line item.
                        </li>
                        <li>
                            Status changes are audited. Avoid downgrading from{" "}
                            <em>Fulfilled</em> unless correcting a mistake.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
