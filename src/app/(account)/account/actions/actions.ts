"use server";

import { NEXT_PUBLIC_URL } from "@/lib/constants";
import { IUserInfo } from "@/lib/types/user-info.types";

export interface UserInfoResponse {
    success: boolean;
    user: IUserInfo | null;
    error?: string;
}

export const getUserInfo = async (
    userId: string
): Promise<UserInfoResponse> => {
    try {
        const res = await fetch(`${NEXT_PUBLIC_URL}/api/get-account-info`, {
            method: "GET",
            headers: {
                "x-user-id": userId,
            },
            cache: "default",
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data: { user: IUserInfo } = await res.json();

        return {
            success: true,
            user: data.user,
        };
    } catch (err) {
        return {
            success: false,
            user: null,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};
