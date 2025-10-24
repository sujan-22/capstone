"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IFavoriteDesign } from "@/lib/types/user-favorite-designs.types";

export interface FavoriteDesignsResponse {
    success: boolean;
    designs: IFavoriteDesign[];
    error?: string;
}

export const getFavoriteDesignsByUser = async (
    userId: string
): Promise<FavoriteDesignsResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/get-favorite-designs`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "default",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch favorite designs");

        const data: { favoriteDesigns: IFavoriteDesign[] } = await res.json();

        return {
            success: true,
            designs: data.favoriteDesigns,
        };
    } catch (err) {
        return {
            success: false,
            designs: [],
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
