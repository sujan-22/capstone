"use server";

import { IPreviewCaseDesign } from "@/app/api/configure/preview/[id]/route";
import { NEXT_PUBLIC_URL } from "@/lib/constants";

export interface GetDesignPreviewResponse {
    success: boolean;
    design?: IPreviewCaseDesign;
    error?: string;
}

export const getDesignPreview = async (
    designId: string,
    userId: string
): Promise<GetDesignPreviewResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/configure/preview/${encodeURIComponent(
                designId
            )}`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "no-store",
            }
        );

        const data = await res.json();

        if (!res.ok || data.error) {
            return {
                success: false,
                error: data.error || "Failed to fetch design preview",
            };
        }

        return {
            success: true,
            design: data.designPreview as IPreviewCaseDesign,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
