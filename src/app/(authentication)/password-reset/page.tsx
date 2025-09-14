"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/context/use-auth-store";
import { authClient } from "../../../../auth-client";
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
    const { email } = useAuthStore();

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
                    router.push("/sign-in");
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
        <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="md:text-xl lg:text-xl sm:text-xl text-md">
                        Reset Your Password
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        Enter a new password below to regain access to your
                        account.
                    </p>
                </div>

                <div className="w-full">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSignUp)}
                            className="grid gap-4"
                        >
                            {fields.map((f) => (
                                <div key={f.name} className="py-1">
                                    <FormInput
                                        name={f.name}
                                        label={f.label}
                                        placeHolder={f.placeHolder}
                                        type={f.type}
                                    />
                                    {f.name === "password" && (
                                        <div className="mt-2">
                                            <PasswordStrengthMeter
                                                password={password}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-2">
                                <Button
                                    isLoading={pending}
                                    type="submit"
                                    className="w-full"
                                    disabled={strength.score < 2}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
