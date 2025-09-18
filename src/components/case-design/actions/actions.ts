"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { ICaseDesignProps } from "../case-design";

export interface FeaturedDesignsResponse {
    success: boolean;
    designs: ICaseDesignProps[] | null;
    error?: string;
}

export const getFeaturedDesigns = async (
    userId: string | undefined
): Promise<FeaturedDesignsResponse> => {
    try {
        const res = await fetch(`${NEXT_PUBLIC_URL}/api/get-featured-designs`, {
            method: "GET",
            headers: {
                "x-user-id": userId ?? "",
            },
            cache: "default",
        });

        if (!res.ok) throw new Error("Failed to fetch featured designs");

        const data: ICaseDesignProps[] = await res.json();

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
