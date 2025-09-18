"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IUnfinishedDesign } from "@/lib/types/unfinished-designs.types";

export interface UnfinishedDesignsResponse {
    success: boolean;
    designs: IUnfinishedDesign[];
    error?: string;
}

export interface DesignHandleResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export const getUnfinishedDesigns = async (
    userId: string
): Promise<UnfinishedDesignsResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/unfinished-designs/get-unfinished-designs`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "default",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch unfinished designs");

        const data: { unfinishedDesigns: IUnfinishedDesign[] } =
            await res.json();

        return {
            success: true,
            designs: data.unfinishedDesigns,
        };
    } catch (err) {
        return {
            success: false,
            designs: [],
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export const deleteUnfinishedDesign = async (
    userId: string,
    caseDesignId: string
): Promise<DesignHandleResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/unfinished-designs/delete-design`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ designId: caseDesignId }),
                cache: "default",
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error: data?.error ?? "Failed to delete design",
            };
        }

        return {
            success: true,
            message: data?.message ?? "Design deleted successfully",
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export const dismissUnfinishedDesign = async (
    userId: string,
    caseDesignId: string
): Promise<DesignHandleResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/unfinished-designs/dismiss-reminder`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ caseDesignId }),
                cache: "default",
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error: data?.error ?? "Failed to dismiss reminder",
            };
        }

        return {
            success: true,
            message: data?.message ?? "Reminder dismissed successfully",
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
