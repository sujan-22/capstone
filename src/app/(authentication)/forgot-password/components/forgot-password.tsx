"use client";

import React, { useEffect, useState } from "react";
import { safeRedirect } from "@/lib/utils";
import AuthHeading from "../../components/auth-heading";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import { authClient } from "../../../../../auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ErrorContext } from "better-auth/react";
import useAuthStore from "@/context/use-auth-store";

const forgotPasswordSchema = z.object({
    email: z.email("Enter a valid email"),
});

type VerificationValues = z.infer<typeof forgotPasswordSchema>;

const fields = [
    {
        name: "email",
        label: "Email",
        placeHolder: "Enter your email",
        type: "text",
    },
];

const ForgotPasswordPage: React.FC = () => {
    const [pending, setPending] = useState(false);
    const { setEmail } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [redirectTo, setRedirectTo] = useState("/");

    useEffect(() => {
        const params = searchParams.get("redirectTo");
        if (params) setRedirectTo(safeRedirect(params));
    }, [searchParams]);

    const form = useForm<VerificationValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleVerification = async (values: VerificationValues) => {
        await authClient.forgetPassword.emailOtp(
            {
                email: values.email,
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onSuccess: async () => {
                    setEmail(values.email);
                    toast({
                        title: "Verification code sent",
                        description:
                            "Please check your email for the verification code.",
                    });
                    router.push(
                        `/password-reset?redirectTo=${encodeURIComponent(
                            redirectTo
                        )}`
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
                title="Forgot your password?"
                description="Enter the email address on your account and we'll send you a 6-digit code to reset it."
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleVerification)}
                    className="grid gap-5"
                >
                    {fields.map((f) => (
                        <FormInput
                            key={f.name}
                            name={f.name}
                            label={f.label}
                            placeHolder={f.placeHolder}
                            type={f.type}
                            autoComplete="email"
                        />
                    ))}

                    <Button
                        isLoading={pending}
                        type="submit"
                        size="lg"
                        className="mt-1 w-full"
                    >
                        Send code
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-sm text-ink-soft">
                Remembered it?{" "}
                <Link
                    href="/sign-in"
                    className="font-semibold text-cobalt underline-offset-4 hover:underline"
                >
                    Back to sign in
                </Link>
            </p>
        </>
    );
};

export default ForgotPasswordPage;
