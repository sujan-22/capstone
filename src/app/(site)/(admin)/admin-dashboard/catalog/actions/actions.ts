"use client";

import axios, { AxiosError } from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";

export const catalogKeys = {
    all: ["catalog"] as const,
    colors: (q?: string) => ["catalog", "colors", q ?? ""] as const,
    finishes: (q?: string) => ["catalog", "finishes", q ?? ""] as const,
    materials: (q?: string) => ["catalog", "materials", q ?? ""] as const,
    models: (q?: string) => ["catalog", "models", q ?? ""] as const,
};

type ApiErrorShape = { error?: string; message?: string };

export type CaseColorDTO = {
    id: string;
    name: string;
    hex: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
};

export type ColorsPage = {
    colors: CaseColorDTO[];
    nextCursor: string | null;
};

export async function fetchColorsPage({
    cursor,
    limit = 50,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<ColorsPage> {
    try {
        const res = await axios.get<ColorsPage>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/colors/get-all`,
            {
                params: { cursor, limit, q },
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;
        throw new Error(
            status
                ? `[${status}] Failed to fetch colors: ${serverMsg}`
                : `Failed to fetch colors: ${serverMsg}`
        );
    }
}

export type CaseFinishDTO = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    createdAt: string;
    active: boolean;
    updatedAt: string;
};

export type FinishesPage = {
    finishes: CaseFinishDTO[];
    nextCursor: string | null;
};

export async function fetchFinishesPage({
    cursor,
    limit = 50,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<FinishesPage> {
    try {
        const res = await axios.get<FinishesPage>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/finishes/get-all`,
            {
                params: { cursor, limit, q },
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;
        throw new Error(
            status
                ? `[${status}] Failed to fetch finishes: ${serverMsg}`
                : `Failed to fetch finishes: ${serverMsg}`
        );
    }
}

export type CaseMaterialDTO = {
    id: string;
    name: string;
    active: boolean;
    price: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
};

export type MaterialsPage = {
    materials: CaseMaterialDTO[];
    nextCursor: string | null;
};

export async function fetchMaterialsPage({
    cursor,
    limit = 50,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<MaterialsPage> {
    try {
        const res = await axios.get<MaterialsPage>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/materials/get-all`,
            {
                params: { cursor, limit, q },
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;
        throw new Error(
            status
                ? `[${status}] Failed to fetch materials: ${serverMsg}`
                : `Failed to fetch materials: ${serverMsg}`
        );
    }
}

export type PhoneModelDTO = {
    id: string;
    modelName: string;
    modelBrand: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ModelsPage = {
    models: PhoneModelDTO[];
    nextCursor: string | null;
};

export async function fetchModelsPage({
    cursor,
    limit = 50,
    q,
    signal,
}: {
    cursor?: string | null;
    limit?: number;
    q?: string;
    signal?: AbortSignal;
}): Promise<ModelsPage> {
    try {
        const res = await axios.get<ModelsPage>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/models/get-all`,
            {
                params: { cursor, limit, q },
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;
        throw new Error(
            status
                ? `[${status}] Failed to fetch models: ${serverMsg}`
                : `Failed to fetch models: ${serverMsg}`
        );
    }
}

export type CatalogEntity = "color" | "finish" | "material" | "model";

export type ToggleActiveResponse = {
    entity: CatalogEntity;
    table: "case_color" | "case_finish" | "case_material" | "phone_model";
    id: string;
    active: boolean;
    updatedAt: string;
};

export async function toggleCatalogItemActive({
    entity,
    id,
    active,
    signal,
}: {
    entity: CatalogEntity;
    id: string;
    active: boolean;
    signal?: AbortSignal;
}): Promise<ToggleActiveResponse> {
    try {
        const res = await axios.patch<ToggleActiveResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/toggle-active`,
            { entity, id, active },
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<{ error?: string; message?: string }>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to toggle active: ${serverMsg}`
                : `Failed to toggle active: ${serverMsg}`
        );
    }
}

export type UpdateFinishPayload = {
    name?: string;
    description?: string | null;
    price?: number;
};

export type UpdateFinishResponse = {
    finish: {
        id: string;
        name: string;
        price: number;
        description: string | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

export async function updateFinish({
    id,
    data,
    signal,
}: {
    id: string;
    data: UpdateFinishPayload;
    signal?: AbortSignal;
}): Promise<UpdateFinishResponse> {
    try {
        const res = await axios.patch<UpdateFinishResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/finishes/${encodeURIComponent(
                id
            )}`,
            data,
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to update finish: ${serverMsg}`
                : `Failed to update finish: ${serverMsg}`
        );
    }
}

export type UpdateMaterialPayload = {
    name?: string;
    description?: string | null;
    price?: number;
};

export type UpdateMaterialResponse = {
    finish: {
        id: string;
        name: string;
        price: number;
        description: string | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

export async function updateMaterial({
    id,
    data,
    signal,
}: {
    id: string;
    data: UpdateMaterialPayload;
    signal?: AbortSignal;
}): Promise<UpdateMaterialResponse> {
    try {
        const res = await axios.patch<UpdateMaterialResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/materials/${encodeURIComponent(
                id
            )}`,
            data,
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to update material: ${serverMsg}`
                : `Failed to update material: ${serverMsg}`
        );
    }
}

export type CreateFinishPayload = {
    name: string;
    description: string;
    price: number;
};

export type CreateFinishResponse = {
    finish: {
        id: string;
        name: string;
        price: number;
        description: string | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

export async function createFinish({
    data,
    signal,
}: {
    data: CreateFinishPayload;
    signal?: AbortSignal;
}): Promise<CreateFinishResponse> {
    try {
        const res = await axios.post<CreateFinishResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/finishes`,
            data,
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to create finish: ${serverMsg}`
                : `Failed to create finish: ${serverMsg}`
        );
    }
}

export type CreateMaterialPayload = {
    name: string;
    description: string;
    price: number;
};

export type CreateMaterialResponse = {
    material: {
        id: string;
        name: string;
        price: number;
        description: string | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

export async function createMaterial({
    data,
    signal,
}: {
    data: CreateMaterialPayload;
    signal?: AbortSignal;
}): Promise<CreateMaterialResponse> {
    try {
        const res = await axios.post<CreateMaterialResponse>(
            `${NEXT_PUBLIC_URL}/api/admin/catalog/materials`,
            data,
            {
                withCredentials: true,
                signal,
                timeout: 15_000,
                validateStatus: (s) => s >= 200 && s < 300,
            }
        );
        return res.data;
    } catch (err) {
        const ax = err as AxiosError<ApiErrorShape>;
        const status = ax.response?.status;
        const serverMsg =
            ax.response?.data?.error ||
            ax.response?.data?.message ||
            ax.message;

        throw new Error(
            status
                ? `[${status}] Failed to create material: ${serverMsg}`
                : `Failed to create material: ${serverMsg}`
        );
    }
}
