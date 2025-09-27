"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import {
    CaseColor,
    CaseFinish,
    CaseMaterial,
    PhoneModel,
} from "@/lib/database/table_types";

export interface UpdateImageResponse {
    success: boolean;
    fileUrl?: string;
    message?: string;
    error?: string;
}

export const updateImageInAWS = async (
    file: File,
    designId: string,
    userId: string,
    croppedImageUrl: string | null
): Promise<UpdateImageResponse> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("designId", designId);

        if (croppedImageUrl) {
            formData.append("croppedImageUrl", croppedImageUrl);
        }

        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/configure/customize/update-image`,
            {
                method: "POST",
                body: formData,
                headers: {
                    "x-user-id": userId,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error: data?.error || "Failed to update image",
            };
        }

        return {
            success: true,
            fileUrl: data.croppedImageUrl,
            message: data.message || "Image updated successfully",
        };
    } catch (err) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Failed to update the image",
        };
    }
};

export interface ConfigDataResponse {
    phoneModels: PhoneModel[];
    caseMaterials: CaseMaterial[];
    caseFinishes: CaseFinish[];
    caseColors: CaseColor[];
}

export interface GetConfigDataResponse {
    success: boolean;
    data?: ConfigDataResponse;
    error?: string;
}

export const getConfigData = async (): Promise<GetConfigDataResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/configure/customize/get-config-data`,
            { method: "GET" }
        );

        const data: ConfigDataResponse | { error?: string } = await res.json();

        if (!res.ok || "error" in data) {
            return {
                success: false,
                error:
                    (data as { error?: string }).error ||
                    "Failed to fetch config data",
            };
        }

        return {
            success: true,
            data: data as ConfigDataResponse,
        };
    } catch (err) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Unknown error fetching config data",
        };
    }
};

export interface UpdateCaseConfigPayload {
    colorId: string;
    materialId: string;
    finishId: string;
    modelId: string;
}

export interface UpdateCaseConfigResponse {
    success: boolean;
    error?: string;
    message?: string;
}

export const updateCaseConfig = async (
    designId: string,
    payload: UpdateCaseConfigPayload
): Promise<UpdateCaseConfigResponse> => {
    if (!designId) {
        return { success: false, error: "designId is required" };
    }

    const allowed: (keyof UpdateCaseConfigPayload)[] = [
        "colorId",
        "materialId",
        "finishId",
        "modelId",
    ];
    const body: Record<string, unknown> = {};
    for (const key of allowed) {
        const v = payload[key];
        if (typeof v === "string" && v.trim() !== "") {
            body[key] = v;
        }
    }

    if (Object.keys(body).length === 0) {
        return { success: false, error: "No updatable fields provided" };
    }

    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/configure/customize/update-config/${encodeURIComponent(
                designId
            )}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const parsed = await res.json().catch(() => ({}));

        if (!res.ok) {
            const errMsg =
                (parsed && (parsed.error || parsed.details)) ||
                `Failed to update config (status ${res.status})`;
            return { success: false, error: String(errMsg) };
        }

        const response = parsed as { success: boolean; message: string };

        if (!response || !response.success) {
            return {
                success: false,
                error: "Unexpected response shape from server",
            };
        }

        return { success: true, message: "Case design updated successfully" };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export interface CustomizeCaseDesign {
    width: number;
    height: number;
    imageUrl: string;
    phoneModelId: string;
    caseMaterialId: string;
    caseFinishId: string;
    caseColorId: string;
    croppedImageUrl: string | null;
}

export const getCustomizeCaseDesign = async (
    designId: string
): Promise<CustomizeCaseDesign> => {
    if (!designId) {
        throw new Error("Design ID is required");
    }

    const res = await fetch(
        `${NEXT_PUBLIC_URL}/api/configure/customize/get-design/${designId}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
            errorBody?.error || `Failed to fetch design (status ${res.status})`
        );
    }

    const data: CustomizeCaseDesign = await res.json();
    return data;
};
