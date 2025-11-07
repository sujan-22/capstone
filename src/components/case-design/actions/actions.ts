"use client";

import { ICaseDesignProps } from "../case-design";
import { http } from "@/lib/http";

export interface FeaturedDesignsResponse {
    success: boolean;
    designs: ICaseDesignProps[] | null;
    error?: string;
}

export const getFeaturedDesigns = async ({
    sort = "none",
    limit,
}: {
    sort: string;
    limit?: number;
}): Promise<FeaturedDesignsResponse> => {
    try {
        const { data } = await http.get<ICaseDesignProps[]>(
            `/api/get-featured-designs?sort=${sort}&limit=${limit}`
        );

        return {
            success: true,
            designs: data,
        };
    } catch (err) {
        return {
            success: false,
            designs: null,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
