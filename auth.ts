import { betterAuth, BetterAuthOptions } from "better-auth";
import { openAPI, username } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./actions/email";

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
            sendChangeEmailVerification: async (
                { user, newEmail, url, token },
                request
            ) => {
                await sendEmail({
                    to: user.email,
                    subject: "Approve email change",
                    text: `Click the link to approve the change: ${url}`,
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
        admin({
            impersonationSessionDuration: 60 * 60 * 24 * 7,
        }),
        emailOTP({
            overrideDefaultEmailVerification: true,
            otpLength: 6,
            expiresIn: 10 * 60,
            allowedAttempts: 5,
            async sendVerificationOTP({ email, otp }) {
                const body = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
                await sendEmail({
                    to: email,
                    subject: "Your verification code",
                    text: body,
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

export type Session = typeof auth.$Infer.Session;
