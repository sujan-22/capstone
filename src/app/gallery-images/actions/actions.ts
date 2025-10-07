"use server";

import axios from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";

export interface GalleryImage {
    id: string;
    url: string;
    created_at: string;
    usage_count?: number;
}

export interface ImageGalleryResponse {
    images: GalleryImage[];
    pagination: {
        limit: number;
        offset: number;
        count: number;
    };
}

/**
 * Fetch paginated gallery images from the API.
 * @param limit - Number of images to fetch per page
 * @param offset - Offset for pagination
 * @param sort - Sorting option: "none" | "popularity_asc" | "popularity_desc"
 */
export const getImageGallery = async (
    limit: number = 20,
    offset: number = 0,
    sort: "none" | "popularity_asc" | "popularity_desc" = "none"
): Promise<ImageGalleryResponse> => {
    try {
        const response = await axios.get<ImageGalleryResponse>(
            `${NEXT_PUBLIC_URL}/api/gallery`,
            {
                params: { limit, offset, sort },
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to fetch gallery images:", error.message);
        } else {
            console.error("Failed to fetch gallery images:", error);
        }
        return {
            images: [],
            pagination: {
                limit,
                offset,
                count: 0,
            },
        };
    }
};

export const createDesignFromGalleryImage = async (
    userId: string,
    gallery_image_id: string,
    imageUrl: string
): Promise<{ success: boolean; designId?: string; error?: string }> => {
    try {
        const payload: {
            gallery_image_id: string;
            imageUrl: string;
        } = {
            gallery_image_id: gallery_image_id,
            imageUrl: imageUrl,
        };

        const response = await axios.post<{ id: string } | { error: string }>(
            `${NEXT_PUBLIC_URL}/api/gallery/use-image`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
            }
        );

        if (!response || !response.data) {
            return {
                success: false,
                error: "No response from server.",
            };
        }

        if ("error" in response.data) {
            return { success: false, error: response.data.error };
        }

        if (typeof (response.data as { id?: string }).id === "string") {
            return {
                success: true,
                designId: (response.data as { id: string }).id,
            };
        }

        return {
            success: false,
            error: "Unexpected server response shape.",
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("useImageFromGallery error:", message);
        return {
            success: false,
            error: message || "Unknown error during use image",
        };
    }
};
