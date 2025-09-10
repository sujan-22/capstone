import { betterAuth, BetterAuthOptions } from "better-auth";
import { openAPI } from "better-auth/plugins";
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
        },
        deleteUser: {
            enabled: true,
        },
        additionalFields: {
            username: {
                type: "string",
                unique: true,
                required: true,
                input: true,
            },
        },
    },
    plugins: [
        openAPI(),
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

    // emailVerification: {
    //     sendOnSignUp: true,
    //     autoSignInAfterVerification: true,
    //     sendVerificationEmail: async ({ user, token }) => {
    //         const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

    //         await sendEmail({
    //             to: user.email,
    //             subject: "Verify your email",
    //             text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    //         });
    //     },
    // },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
