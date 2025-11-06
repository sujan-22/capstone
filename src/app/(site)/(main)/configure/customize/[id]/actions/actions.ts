"use client";

import {
    CaseColor,
    CaseFinish,
    CaseMaterial,
    PhoneModel,
} from "@/lib/database/table_types";
import { http } from "@/lib/http";

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

        const { data } = await http.post<{
            success: boolean;
            croppedImageUrl: string;
            message?: string;
            error?: string;
        }>("/api/configure/customize/update-image", formData);

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
        const { data } = await http.get<ConfigDataResponse>(
            "/api/configure/customize/get-config-data"
        );

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
        const { data } = await http.patch<{
            success: boolean;
            message: string;
        }>(
            `/api/configure/customize/update-config/${encodeURIComponent(
                designId
            )}`,
            body
        );

        if (data?.success) {
            return {
                success: true,
                message: data.message ?? "Case design updated successfully",
            };
        }

        return {
            success: false,
            error: data?.message || "Failed to update case design",
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export interface CustomizeCaseDesign {
    design: {
        width: number;
        height: number;
        imageUrl: string;
        phoneModelId: string;
        caseMaterialId: string;
        caseFinishId: string;
        caseColorId: string;
        croppedImageUrl: string | null;
    } | null;
    error?: string;
}

export const getCustomizeCaseDesign = async (
    designId: string
): Promise<CustomizeCaseDesign> => {
    if (!designId) {
        return { error: "Design ID is required", design: null };
    }

    const { data } = await http.get<CustomizeCaseDesign>(
        `/api/configure/customize/get-design/${designId}`
    );

    if (!data || !data.design || data.error) {
        return { error: "No design data found", design: null };
    }

    return { design: data.design };
};
