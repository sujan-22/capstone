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
