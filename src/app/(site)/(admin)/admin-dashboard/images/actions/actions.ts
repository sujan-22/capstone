"use client";

import axios from "axios";
import { http } from "@/lib/http";

export const adminImagesKeys = {
    all: ["admin", "images"] as const,
    list: (q: string, filters: Record<string, string>) =>
        [...adminImagesKeys.all, "list", { q, ...filters }] as const,
};

export type AdminImageItem = {
    id: string;
    url: string;
    active: boolean;
    usageCount: number;
    createdAt: string;
    lastUsedAt?: string | null;
};

export type ImagesPage = {
    images: AdminImageItem[];
    nextCursor: string | null;
};

export async function fetchAdminImagesPage({
    cursor,
    limit,
    signal,
}: {
    cursor: string | null;
    limit: number;
    signal?: AbortSignal;
}): Promise<ImagesPage> {
    try {
        const { data } = await http.get("/api/admin/images/get-all", {
            params: { cursor, limit },
            signal,
        });
        return data;
    } catch (err) {
        const msg = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : "Failed to load images.";
        throw new Error(msg);
    }
}

export async function setImageActive(id: string, active: boolean) {
    try {
        await http.patch(`/api/admin/images/${id}`, { active });
    } catch (err) {
        const msg = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : "Failed to update image.";
        throw new Error(msg);
    }
}

export interface UploadFileResponse {
    success: boolean;
    error?: string;
}

type ApiSuccess = {
    id: string;
};

type ApiError = {
    error?: string;
    details?: string;
};

export const uploadGalleryImage = async (
    file: File,
    onProgress: (progress: number) => void
): Promise<UploadFileResponse> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await http.post<ApiSuccess | ApiError>(
            "/api/admin/images/upload",
            formData,
            {
                onUploadProgress: (event) => {
                    if (event.total) {
                        const percent = Math.round(
                            (event.loaded * 100) / event.total
                        );
                        onProgress(percent);
                    }
                },
            }
        );

        const payload = res.data;

        if ("error" in payload) {
            return {
                success: false,
                error: payload.error || "Unknown error from server",
            };
        }

        if (!payload || typeof (payload as ApiSuccess).id !== "string") {
            return {
                success: false,
                error: "Upload succeeded but server returned unexpected response.",
            };
        }

        return {
            success: true,
        };
    } catch (err) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Unknown error during upload",
        };
    }
};
