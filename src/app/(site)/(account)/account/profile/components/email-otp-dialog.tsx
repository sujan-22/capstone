"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../../../../auth-client";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { ErrorContext } from "better-auth/react";
import { Form } from "@/components/ui/form";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    email: string;
    onVerified?: () => void;
};

const emailVerificationSchema = z.object({
    verificationCode: z
        .string()
        .min(6, "Enter a valid verification code")
        .max(6, "Enter a valid verification code"),
});

type VerificationValues = z.infer<typeof emailVerificationSchema>;

const RESEND_COOLDOWN = 60;

export default function EmailOtpDialog({
    open,
    onOpenChange,
    email,
    onVerified,
}: Props) {
    const { toast } = useToast();

    const form = useForm<VerificationValues>({
        resolver: zodResolver(emailVerificationSchema),
        defaultValues: { verificationCode: "" },
        mode: "onSubmit",
    });

    const [pending, setPending] = React.useState(false);
    const [resendPending, setResendPending] = React.useState(false);
    const [cooldown, setCooldown] = React.useState<number>(RESEND_COOLDOWN);

    React.useEffect(() => {
        if (!open) return;
        setCooldown(RESEND_COOLDOWN);
    }, [open]);

    // cooldown ticker
    React.useEffect(() => {
        if (!open || cooldown <= 0) return;
        const id = setInterval(() => {
            setCooldown((c) => (c <= 1 ? 0 : c - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [open, cooldown]);

    const handleVerification = async ({
        verificationCode,
    }: VerificationValues) => {
        if (!email) {
            toast({
                title: "Missing email",
                description: "We couldn't determine your new email.",
                variant: "destructive",
            });
            return;
        }

        setPending(true);
        await authClient.emailOtp.verifyEmail(
            {
                email,
                otp: verificationCode.trim(),
            },
            {
                onSuccess: () => {
                    toast({
                        title: "Email verified",
                        description: "Your email has been verified.",
                    });
                    onOpenChange(false);
                    onVerified?.();
                },
                onError: (ctx: ErrorContext) => {
                    form.setError("verificationCode", {
                        type: "manual",
                        message: ctx.error.message ?? "Invalid or expired code",
                    });
                    toast({
                        title: "Verification failed",
                        description:
                            ctx.error.message ?? "Invalid or expired code",
                        variant: "destructive",
                    });
                    setPending(false);
                },
                onFinally: () => {
                    setPending(false);
                },
            }
        );
    };

    const handleResend = async () => {
        if (!email) {
            toast({
                title: "Missing email",
                description: "We couldn't determine your new email.",
                variant: "destructive",
            });
            return;
        }
        if (cooldown > 0 || resendPending) return;

        setResendPending(true);
        await authClient.emailOtp.sendVerificationOtp(
            {
                email,
                type: "email-verification",
            },
            {
                onSuccess: () => {
                    toast({
                        title: "Verification sent",
                        description: `A new code has been sent to ${email}.`,
                    });
                    setCooldown(RESEND_COOLDOWN);
                },
                onError: (ctx: ErrorContext) => {
                    toast({
                        title: "Could not resend",
                        description: ctx.error.message ?? "Try again later.",
                        variant: "destructive",
                    });
                },
                onFinally: () => {
                    setResendPending(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify your new email</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code we sent to{" "}
                    <span className="font-medium">{email}</span>.
                </p>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleVerification)}
                        className="grid gap-4"
                    >
                        <Controller
                            control={form.control}
                            name="verificationCode"
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <InputOTP
                                        maxLength={6}
                                        value={field.value}
                                        onChange={field.onChange}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            )}
                        />

                        {form.formState.errors.verificationCode && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.verificationCode.message}
                            </p>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResend}
                                disabled={resendPending || cooldown > 0}
                            >
                                {cooldown > 0
                                    ? `Resend code (${cooldown}s)`
                                    : "Resend code"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    pending ||
                                    form.watch("verificationCode").length !== 6
                                }
                                isLoading={pending}
                            >
                                Verify
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
