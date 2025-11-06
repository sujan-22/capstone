"use client";

import { http } from "@/lib/http";
import { IFavoriteDesign } from "@/lib/types/user-favorite-designs.types";

export interface FavoriteDesignsResponse {
    success: boolean;
    designs: IFavoriteDesign[];
    error?: string;
}

export const getFavoriteDesignsByUser =
    async (): Promise<FavoriteDesignsResponse> => {
        try {
            const { data } = await http.get<{
                favoriteDesigns: IFavoriteDesign[];
            }>("/api/account/get-favorite-designs");

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
