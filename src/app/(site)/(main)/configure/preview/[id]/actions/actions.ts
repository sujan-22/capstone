"use client";

import { IPreviewCaseDesign } from "@/app/api/configure/preview/[id]/route";
import { http } from "@/lib/http";

export interface GetDesignPreviewResponse {
    success: boolean;
    design?: IPreviewCaseDesign;
    error?: string;
}

export const getDesignPreview = async (
    designId: string
): Promise<GetDesignPreviewResponse> => {
    try {
        const { data } = await http.get<{ designPreview: IPreviewCaseDesign }>(
            `/api/configure/preview/${encodeURIComponent(designId)}`
        );

        return {
            success: true,
            design: data.designPreview as IPreviewCaseDesign,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export interface CreateCheckoutResult {
    success: boolean;
    url?: string;
    orderId?: string;
    orderNumber?: string;
    amount?: number;
    error?: string;
}

export const createCheckoutSession = async ({
    caseDesignId,
}: {
    caseDesignId: string;
}): Promise<CreateCheckoutResult> => {
    try {
        const { data } = await http.post<{
            success: boolean;
            url?: string;
            orderId?: string;
            orderNumber?: string;
            amount?: number;
            error?: string;
        }>(`/api/configure/preview/${encodeURIComponent(caseDesignId)}`);

        if (!data?.success || !data.url) {
            return {
                success: false,
                error: data?.error || "Failed to create checkout session",
            };
        }

        return {
            success: true,
            url: data.url,
            orderId: data.orderId!,
            orderNumber: data.orderNumber!,
            amount: data.amount!,
        };
    } catch (err) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err?.message
                    : "Failed to create checkout session",
        };
    }
};
