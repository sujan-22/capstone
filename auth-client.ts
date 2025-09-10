import { createAuthClient } from "better-auth/react";
import {
    adminClient,
    emailOTPClient,
    inferAdditionalFields,
} from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        adminClient(),
        inferAdditionalFields<typeof auth>(),
        emailOTPClient(),
    ],
});

export type IUser = typeof authClient.$Infer.Session.user;
export type ISession = typeof authClient.$Infer.Session.session;
