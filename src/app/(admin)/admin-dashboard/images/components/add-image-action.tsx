"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AddImageDialog } from "./image-dialog";
import { adminImagesKeys } from "../actions/actions";

/** The header's "Add image" button, refreshing the grid after an upload. */
export default function AddImageAction() {
    const qc = useQueryClient();
    return (
        <AddImageDialog
            onUploaded={() =>
                qc.invalidateQueries({ queryKey: adminImagesKeys.all, exact: false })
            }
        />
    );
}
