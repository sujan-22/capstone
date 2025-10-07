import axios from "axios";
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
    userId: string,
    onProgress: (progress: number) => void
): Promise<UploadFileResponse> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post<ApiSuccess | ApiError>(
            `${NEXT_PUBLIC_URL}/api/configure/upload`,
            formData,
            {
                headers: {
                    "x-user-id": userId,
                },
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
            designId: (payload as ApiSuccess).id,
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
