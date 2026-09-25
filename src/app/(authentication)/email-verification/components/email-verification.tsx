"use client";

import React, { useEffect, useState } from "react";
import { safeRedirect } from "@/lib/utils";
import AuthHeading from "../../components/auth-heading";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../../auth-client";
import useAuthStore from "@/context/use-auth-store";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const emailVerificationSchema = z.object({
    verificationCode: z
        .string()
        .min(6, "Enter a valid verification code")
        .max(6, "Enter a valid verification code"),
});

type VerificationValues = z.infer<typeof emailVerificationSchema>;

const RESEND_COOLDOWN = 60;

const EmailVerificationPage: React.FC = () => {
    const router = useRouter();
    const { email } = useAuthStore();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [redirectTo, setRedirectTo] = useState("/");

    useEffect(() => {
        const params = searchParams.get("redirectTo");
        if (params) setRedirectTo(safeRedirect(params));
    }, [searchParams]);

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
        <>
            <AuthHeading
                eyebrow="Verify your email"
                title="Check your inbox"
                description={
                    email ? (
                        <>
                            We sent a 6-digit code to{" "}
                            <span className="font-semibold text-ink">
                                {email}
                            </span>
                            . Enter it below to finish setting up your
                            account.
                        </>
                    ) : (
                        "Enter the 6-digit code we emailed you to finish setting up your account."
                    )
                }
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleVerification)}
                    className="grid gap-5"
                >
                    <Controller
                        control={form.control}
                        name="verificationCode"
                        render={({ field }) => (
                            <InputOTP
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                                aria-label="Verification code"
                                containerClassName="justify-between"
                            >
                                <InputOTPGroup className="w-full justify-between gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <InputOTPSlot key={i} index={i} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        )}
                    />
                    {form.formState.errors.verificationCode && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.verificationCode.message}
                        </p>
                    )}

                    <Button
                        isLoading={pending}
                        type="submit"
                        size="lg"
                        className="mt-1 w-full"
                    >
                        Verify email
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-sm text-ink-soft">
                Didn&rsquo;t get it?{" "}
                <Button
                    variant="link"
                    className="h-auto font-semibold"
                    onClick={handleResend}
                    disabled={resendPending || cooldown > 0}
                >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Button>
            </p>
        </>
    );
};

export default EmailVerificationPage;
