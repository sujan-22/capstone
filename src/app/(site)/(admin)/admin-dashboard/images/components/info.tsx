import { Images as ImagesIcon, ToggleRight, UploadCloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminImagesInfo() {
    return (
        <div className="grid w-full items-start gap-3">
            {/* What this table is */}
            <Alert>
                <ImagesIcon />
                <AlertTitle>Gallery images</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            This table powers the public{" "}
                            <strong>Image Gallery</strong> that customers browse
                            when adding images to their designs.
                        </li>
                        <li>
                            Columns: <strong>URL</strong>,{" "}
                            <strong>Active</strong>, <strong>Usage</strong> (how
                            many designs reference the image),
                            <strong> Added</strong>, and{" "}
                            <strong>Last used</strong>.
                        </li>
                        <li>
                            Use the menu on each row to{" "}
                            <strong>open the image</strong> in a new tab.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Visibility / Active behaviour */}
            <Alert>
                <ToggleRight />
                <AlertTitle>Visibility & “Active”</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Toggling <strong>Active</strong> immediately
                            hides/shows the image in the customer gallery.
                        </li>
                        <li>
                            Deactivating an image <em>does not</em> break
                            existing designs that already use it.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Upload rules */}
            <Alert>
                <UploadCloud />
                <AlertTitle>Uploading guidelines</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                        <li>
                            Supported types: <strong>PNG</strong>,{" "}
                            <strong>JPG</strong>/<strong>JPEG</strong>. Max
                            size: <strong>10&nbsp;MB</strong>.
                        </li>
                        <li>
                            Only upload assets you have the right to distribute.
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
