"use client";

import axios from "axios";
import { http } from "@/lib/http";

export type ChangeEmailResult =
    | { success: true }
    | { success: false; error: string; status?: number };

export const changeEmail = async (
    email: string
): Promise<ChangeEmailResult> => {
    try {
        const { data } = await http.post("/api/account/change-email", {
            newEmail: email.trim(),
        });

        if (data?.success) return { success: true };

        return {
            success: false,
            error: data?.error || "Failed to change email.",
        };
    } catch (err: unknown) {
        let status: number | undefined;
        let apiMsg: string | undefined;

        if (axios.isAxiosError(err)) {
            status = err.response?.status;
            apiMsg = err.response?.data?.error;
        }

        const message =
            apiMsg ||
            (status === 401
                ? "You need to sign in to change your email."
                : status === 409
                ? "That email is already in use."
                : status === 400
                ? "Please enter a valid email."
                : "Something went wrong while changing your email.");

        return { success: false, error: message, status };
    }
};
