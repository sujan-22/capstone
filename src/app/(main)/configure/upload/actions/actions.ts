"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";

export interface UploadFileResponse {
    success: boolean;
    fileUrl?: string;
    error?: string;
}

export const uploadUserImage = async (
    file: File
): Promise<UploadFileResponse> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${NEXT_PUBLIC_URL}/api/configure/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload file");

        const data: { success: boolean; fileUrl: string } = await res.json();

        return {
            success: true,
            fileUrl: data.fileUrl,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
