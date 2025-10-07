"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";
import useAuthStore from "@/context/use-auth-store";

const emailVerificationSchema = z.object({
    verificationCode: z
        .string()
        .min(6, "Enter a valid verification code")
        .max(6, "Enter a valid verification code"),
});

type VerificationValues = z.infer<typeof emailVerificationSchema>;

const fields = [
    {
        name: "verificationCode",
        label: "Verification Code",
        placeHolder: "Enter the 6-digit code",
        type: "text",
    },
];

const RESEND_COOLDOWN = 60;

const EmailVerificationPage: React.FC = () => {
    const router = useRouter();
    const { email } = useAuthStore();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";
    const { toast } = useToast();

    const [pending, setPending] = useState(false);
    const [resendPending, setResendPending] = useState(false);
    const [cooldown, setCooldown] = useState<number>(RESEND_COOLDOWN);

    const form = useForm<VerificationValues>({
        resolver: zodResolver(emailVerificationSchema),
        defaultValues: { verificationCode: "" },
    });

    useEffect(() => {
        if (cooldown <= 0) return;

        const id = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [cooldown]);

    const handleVerification = async (values: VerificationValues) => {
        if (!email) {
            // TODO: DO SOMETHING TO RETRIEVE EMAIL
            return;
        }

        setPending(true);
        try {
            const { error } = await authClient.emailOtp.verifyEmail({
                email,
                otp: values.verificationCode.trim(),
            });

            if (error) {
                form.setError("verificationCode", {
                    type: "manual",
                    message: error.message ?? "Invalid or expired code",
                });
                toast({
                    title: "Verification failed",
                    description: error.message ?? "Invalid or expired code",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Email verified",
                description: "Your email has been verified.",
            });

            router.push(
                `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
            );
        } catch (err) {
            console.error("verify error:", err);
            form.setError("verificationCode", {
                type: "manual",
                message: "Verification failed. Try again.",
            });
            toast({
                title: "Error",
                description: "Verification failed. Try again.",
                variant: "destructive",
            });
        } finally {
            setPending(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast({
                title: "Missing email",
                description:
                    "Unable to determine your email. Please retry signup.",
                variant: "destructive",
            });
            router.push(
                `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`
            );
            return;
        }

        if (cooldown > 0) return;

        setResendPending(true);
        try {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
            });

            if (error) {
                toast({
                    title: "Could not resend",
                    description: error.message ?? "Try again later.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Verification sent",
                description: "A new code has been sent to your email.",
            });
            setCooldown(RESEND_COOLDOWN);
        } catch (err) {
            console.error("resend error:", err);
            toast({
                title: "Error",
                description: "Failed to resend code. Try again later.",
                variant: "destructive",
            });
        } finally {
            setResendPending(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-114px)] flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="md:text-xl lg:text-xl sm:text-xl text-md">
                        Verify Your Email
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        {email ? (
                            <>
                                We sent a 6-digit verification code to{" "}
                                <span className=" font-semibold">{email}</span>.
                                Enter it below.
                            </>
                        ) : (
                            <>
                                Please check your email and enter the
                                verification code below.
                            </>
                        )}
                    </p>
                </div>

                <div className="w-full">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleVerification)}
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
                                </div>
                            ))}

                            <Button
                                isLoading={pending}
                                type="submit"
                                className="w-full mt-2"
                            >
                                Verify Email
                            </Button>
                        </form>
                    </Form>
                </div>

                <div className="mt-4 w-full flex flex-col items-center">
                    <Button
                        variant="link"
                        className="text-blue-500 px-0"
                        onClick={handleResend}
                        disabled={resendPending || cooldown > 0}
                    >
                        {cooldown > 0
                            ? `Resend Code (${cooldown}s)`
                            : "Resend Code"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
