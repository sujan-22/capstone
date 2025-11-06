import { createAuthClient } from "better-auth/react";
import {
    adminClient,
    emailOTPClient,
    lastLoginMethodClient,
    usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        adminClient(),
        emailOTPClient(),
        usernameClient(),
        lastLoginMethodClient(),
    ],
});

export type IUser = typeof authClient.$Infer.Session.user;
export type ISession = typeof authClient.$Infer.Session.session;
