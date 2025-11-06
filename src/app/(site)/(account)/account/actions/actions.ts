"use client";

import { http } from "@/lib/http";
import type { IUserInfo } from "@/lib/types/user-info.types";
import type { AxiosError } from "axios";

export interface UserInfoResponse {
    success: boolean;
    user: IUserInfo | null;
    error?: string;
}

export const getUserInfo = async (): Promise<UserInfoResponse> => {
    try {
        const { data } = await http.get<{ user: IUserInfo }>(
            "/api/account/get-account-info"
        );

        return {
            success: true,
            user: data?.user ?? null,
        };
    } catch (e) {
        const err = e as AxiosError<{ error?: string }>;
        return {
            success: false,
            user: null,
            error: err.response?.data?.error || err.message || "Unknown error",
        };
    }
};
