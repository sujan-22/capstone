"use client";

import { http } from "@/lib/http";
import { IReminder } from "@/lib/types/reminders.types";

export interface RemindersResponse {
    success: boolean;
    reminders: IReminder[];
    error?: string;
}

export const getReminders = async (): Promise<RemindersResponse> => {
    try {
        const { data } = await http.get<{
            reminders: IReminder[];
        }>("/api/account/reminders/get-reminders");

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
    reminderId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data } = await http.post<{
            success: boolean;
            error?: string;
        }>("/api/account/reminders/dismiss-reminder", { reminderId });

        return { success: data?.success ?? true, error: data?.error };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
