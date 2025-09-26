"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";

export interface UploadFileResponse {
    success: boolean;
    designId?: string;
    error?: string;
}

type ApiSuccess = {
    id: string;
};

type ApiError = {
    error?: string;
    details?: string;
};

export const uploadUserImage = async (
    file: File,
    userId: string
): Promise<UploadFileResponse> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${NEXT_PUBLIC_URL}/api/configure/upload`, {
            method: "POST",
            body: formData,
            headers: {
                "x-user-id": userId,
            },
        });
        const payload = (await res.json().catch(() => ({}))) as
            | ApiSuccess
            | ApiError;

        if (!res.ok) {
            const errMsg = `Upload failed with status ${res.status}`;
            return { success: false, error: String(errMsg) };
        }

        const data = payload as ApiSuccess;

        if (!data || typeof data.id !== "string") {
            return {
                success: false,
                error: "Upload succeeded but server returned unexpected response.",
            };
        }

        return {
            success: true,
            designId: data.id,
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
