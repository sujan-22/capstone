"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";
import { authClient } from "../../../../auth-client";
import { useRouter } from "next/navigation";
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
    const { toast } = useToast();

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
                    router.push("/password-reset");
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
        <div className="min-h-[calc(100vh-114px)] flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="md:text-xl lg:text-xl sm:text-xl text-md">
                        Reset Your Password
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        Enter your registered email address and we will send you
                        a verification code.
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
                                Send Code
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
