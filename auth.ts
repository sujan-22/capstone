import { betterAuth, BetterAuthOptions } from "better-auth";
import { lastLoginMethod, openAPI, username } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./actions/email";
import {
    renderChangeEmailEmail,
    renderChangeEmailText,
    renderOtpEmail,
    renderOtpText,
} from "@/lib/email/templates";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, url }) => {
                await sendEmail({
                    to: user.email,
                    subject: "Approve email change",
                    text: renderChangeEmailText(url),
                    html: renderChangeEmailEmail(url),
                });
            },
        },
        deleteUser: {
            enabled: true,
        },
    },
    plugins: [
        openAPI(),
        username(),
        lastLoginMethod(),
        admin({
            impersonationSessionDuration: 60 * 60 * 24 * 7,
        }),
        emailOTP({
            overrideDefaultEmailVerification: true,
            otpLength: 6,
            expiresIn: 10 * 60,
            allowedAttempts: 5,
            async sendVerificationOTP({ email, otp }) {
                await sendEmail({
                    to: email,
                    subject: "Your verification code",
                    text: renderOtpText(otp),
                    html: renderOtpEmail(otp),
                });
            },
        }),
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
} satisfies BetterAuthOptions);

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
