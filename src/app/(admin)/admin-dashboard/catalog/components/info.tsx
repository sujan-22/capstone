import {
    AlertCircleIcon,
    InfoIcon,
    EyeIcon,
    EyeOffIcon,
    Layers3Icon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminCatalogInfo() {
    return (
        <div className="grid w-full items-start gap-3">
            {/* Visibility / Active */}
            <Alert>
                <InfoIcon />
                <AlertTitle>How “Active” works</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <strong>Active</strong> items are{" "}
                            <span className="inline-flex items-center gap-1">
                                <EyeIcon className="h-3 w-3" /> visible
                            </span>{" "}
                            to customers across the site.
                        </li>
                        <li>
                            Turning <strong>Active</strong> off hides the item{" "}
                            <span className="inline-flex items-center gap-1">
                                <EyeOffIcon className="h-3 w-3" /> (not visible)
                            </span>{" "}
                            but does <em>not</em> delete it and won’t affect
                            existing orders.
                        </li>
                        <li>
                            All edits take effect immediately wherever the item
                            is used.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Field guidance per section */}
            <Alert>
                <Layers3Icon />
                <AlertTitle>Catalog field guidelines</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            <strong>Colors</strong>: use a clear name and a
                            valid HEX (e.g. <code>#FF0000</code>). Names/HEX
                            should be unique.
                        </li>
                        <li>
                            <strong>Phone Models</strong>: use the public-facing
                            name (e.g. “iPhone 15 Pro”). Deactivate to stop
                            offering a model.
                        </li>
                        <li>
                            <strong>Finishes</strong>: price is <em>added</em>{" "}
                            on top of the material price.
                        </li>
                        <li>
                            <strong>Materials</strong>: price is pre-tax (CAD).
                            Keep descriptions short and benefits focused.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Safety / integrity rules */}
            <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Data safety</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Items referenced by existing designs or orders may
                            be protected from deletion.
                        </li>
                        <li>
                            Prefer deactivating instead of deleting to preserve
                            history.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
