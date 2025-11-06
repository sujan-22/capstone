"use client";

import { http } from "@/lib/http";
import { IUnfinishedDesign } from "@/lib/types/unfinished-designs.types";

export interface UnfinishedDesignsResponse {
    success: boolean;
    designs: IUnfinishedDesign[];
    error?: string;
}

export interface DesignHandleResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export const getUnfinishedDesigns =
    async (): Promise<UnfinishedDesignsResponse> => {
        try {
            const { data } = await http.get<{
                unfinishedDesigns: IUnfinishedDesign[];
            }>("/api/account/unfinished-designs/get-unfinished-designs");

            return {
                success: true,
                designs: data.unfinishedDesigns,
            };
        } catch (err) {
            return {
                success: false,
                designs: [],
                error: err instanceof Error ? err.message : "Unknown error",
            };
        }
    };

export const deleteUnfinishedDesign = async (
    caseDesignId: string
): Promise<DesignHandleResponse> => {
    try {
        const { data } = await http.post<{
            success: boolean;
            message?: string;
            error?: string;
        }>("/api/account/unfinished-designs/delete-design", {
            designId: caseDesignId,
        });

        return {
            success: true,
            message: data?.message ?? "Design deleted successfully",
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
