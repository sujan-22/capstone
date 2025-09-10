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
import { GoArrowUpRight } from "react-icons/go";

const passwordResetSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpValues = z.infer<typeof passwordResetSchema>;

const fields = [
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

    const form = useForm<SignUpValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const handleSignUp = async (values: SignUpValues) => {
        try {
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
                                </div>
                            ))}

                            <div className="pt-2">
                                <Button
                                    isLoading={pending}
                                    type="submit"
                                    className="w-full"
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
