"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";

const emailVerificationSchema = z.object({
    verificationCode: z.string().min(6, "Enter a valid verification code"),
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

const EmailVerificationPage: React.FC = () => {
    const [pending, setPending] = useState(false);

    const form = useForm<VerificationValues>({
        resolver: zodResolver(emailVerificationSchema),
        defaultValues: {
            verificationCode: "",
        },
    });

    const handleVerification = async (values: VerificationValues) => {
        setPending(true);
        try {
            console.log("Verification code entered:", values.verificationCode);
        } catch (err) {
            console.error(err);
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="text-muted-foreground text-sm">
                        Please check your email and enter the verification code
                        below
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

                <div className="mt-4 w-full flex justify-center">
                    <Button variant="link" className="text-blue-500 px-0">
                        Resend Code
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
