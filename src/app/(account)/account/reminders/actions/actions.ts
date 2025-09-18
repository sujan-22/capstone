"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IReminder } from "@/lib/types/reminders.types";

export interface RemindersResponse {
    success: boolean;
    reminders: IReminder[];
    error?: string;
}

export const getReminders = async (
    userId: string
): Promise<RemindersResponse> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/reminders/get-reminders`,
            {
                method: "GET",
                headers: {
                    "x-user-id": userId,
                },
                cache: "default",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch reminders");

        const data: { reminders: IReminder[] } = await res.json();

        return {
            success: true,
            reminders: data.reminders,
        };
    } catch (err) {
        return {
            success: false,
            reminders: [],
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};

export const dismissReminder = async (
    userId: string,
    caseDesignId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const res = await fetch(
            `${NEXT_PUBLIC_URL}/api/account/reminders/dismiss-reminder`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ caseDesignId }),
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            return {
                success: false,
                error:
                    errorData?.error ||
                    `Request failed with status ${res.status}`,
            };
        }

        const data = await res.json().catch(() => null);
        return { success: data?.success ?? true, error: data?.error };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
