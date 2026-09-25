"use client";

import React, { useEffect, useState } from "react";
import { safeRedirect } from "@/lib/utils";
import AuthHeading from "../../components/auth-heading";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/context/use-auth-store";
import { authClient } from "../../../../../auth-client";
import { ErrorContext } from "better-auth/react";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";

const passwordResetSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        verificationCode: z
            .string()
            .min(6, "Enter a valid verification code")
            .max(6, "Enter a valid verification code"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpValues = z.infer<typeof passwordResetSchema>;

const fields = [
    {
        name: "verificationCode",
        label: "Verification Code",
        placeHolder: "Enter the 6-digit code",
        type: "text",
    },
    {
        name: "password",
        label: "New Password",
        placeHolder: "********",
        type: "password",
    },
    {
        name: "confirmPassword",
        label: "Confirm New Password",
        placeHolder: "confirm password",
        type: "password",
    },
];

const PasswordResetPage: React.FC = () => {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const { email } = useAuthStore();

    const [redirectTo, setRedirectTo] = useState("/");

    useEffect(() => {
        const params = searchParams.get("redirectTo");
        if (params) setRedirectTo(safeRedirect(params));
    }, [searchParams]);

    const form = useForm<SignUpValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            verificationCode: "",
        },
    });

    const password = form.watch("password");
    const strength = usePasswordStrength(password);

    const handleSignUp = async (values: SignUpValues) => {
        if (!email) {
            return;
        }
        await authClient.emailOtp.resetPassword(
            {
                email: email,
                otp: values.verificationCode,
                password: values.password,
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onSuccess: async () => {
                    toast({
                        title: "Password Reset Successful",
                        description:
                            "Your password has been updated successfully.",
                    });
                    router.push(
                        `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
                    );
                },
                onError: (ctx: ErrorContext) => {
                    toast({
                        title: "Something went wrong",
                        description:
                            ctx.error.message ?? "Something went wrong.",
                        variant: "destructive",
                    });
                },
            }
        );
        setPending(false);
    };

    return (
        <>
            <AuthHeading
                eyebrow="Reset password"
                title="Choose a new password"
                description={
                    email ? (
                        <>
                            Enter the code we sent to{" "}
                            <span className="font-semibold text-ink">
                                {email}
                            </span>{" "}
                            and pick a new password.
                        </>
                    ) : (
                        "Enter the code from your email and pick a new password."
                    )
                }
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSignUp)}
                    className="grid gap-5"
                >
                    {fields.map((f) => (
                        <div key={f.name}>
                            <FormInput
                                name={f.name}
                                label={f.label}
                                placeHolder={f.placeHolder}
                                type={f.type}
                                autoComplete={
                                    f.name === "verificationCode"
                                        ? "one-time-code"
                                        : "new-password"
                                }
                            />
                            {f.name === "password" && (
                                <PasswordStrengthMeter password={password} />
                            )}
                        </div>
                    ))}

                    <Button
                        isLoading={pending}
                        type="submit"
                        size="lg"
                        className="mt-1 w-full"
                        disabled={strength.score < 2}
                    >
                        Update password
                    </Button>
                </form>
            </Form>
        </>
    );
};

export default PasswordResetPage;
