"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";
import { FcGoogle } from "react-icons/fc";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../../auth-client";
import { ErrorContext } from "better-auth/react";

const signInSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signInSchema>;

const fields = [
    {
        name: "username",
        label: "Username",
        placeHolder: "your username",
        type: "text",
    },
    {
        name: "password",
        label: "Password",
        placeHolder: "********",
        type: "password",
    },
];

const SignInPage: React.FC = () => {
    const [pending, setPending] = useState(false);
    const [remember, setRemember] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [redirectTo, setRedirectTo] = useState("/");

    useEffect(() => {
        const params = searchParams.get("redirectTo");
        if (params) setRedirectTo(params);
    }, [searchParams]);

    const { toast } = useToast();

    const form = useForm<SignUpValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const handleSignUp = async (values: SignUpValues) => {
        await authClient.signIn.username(
            {
                username: values.username,
                password: values.password,
                rememberMe: remember,
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onSuccess: async () => {
                    toast({
                        title: "Signed in successfully",
                        description: "You have been signed in successfully.",
                    });
                    router.push(redirectTo);
                    router.refresh();
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

    const handleGoogleSignUp = async () => {
        await authClient.signIn.social(
            {
                provider: "google",
                callbackURL: redirectTo,
            },
            {
                onError: (error) => {
                    toast({
                        title: "Error",
                        description:
                            error.error.message ?? "Something went wrong.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <div className="min-h-[calc(100vh-114px)] flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="md:text-xl lg:text-xl sm:text-xl text-md">
                        Sign in to your account
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        Enter your credentials below to access your account.
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
                            <div className="flex items-center mt-2">
                                <Checkbox
                                    id="remember-me"
                                    className="mr-2"
                                    checked={remember}
                                    onCheckedChange={(val) =>
                                        setRemember(Boolean(val))
                                    }
                                />
                                <Label
                                    htmlFor="remember-me"
                                    className="text-sm"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <div className="mt-2 w-full text-right">
                                <Button
                                    variant="link"
                                    className="text-blue-500 px-0"
                                    onClick={() => {
                                        router.push("/forgot-password");
                                    }}
                                >
                                    Forgot Password?
                                </Button>
                            </div>

                            <div className="pt-2">
                                <Button
                                    isLoading={pending}
                                    type="submit"
                                    className="w-full"
                                >
                                    Sign In
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="mt-4 w-full flex justify-center">
                    Or continue with
                </div>
                <div className="mt-2 w-full text-center">
                    <p className="text-sm text-muted-foreground">
                        Don’t have an account?{" "}
                        <Button
                            variant="link"
                            className="text-blue-500 px-0"
                            onClick={() =>
                                router.push(
                                    `/sign-up?redirectTo=${encodeURIComponent(
                                        redirectTo
                                    )}`
                                )
                            }
                        >
                            Sign Up
                        </Button>
                    </p>
                </div>
                <div className="mt-4 w-full flex justify-center">
                    <Button
                        className="w-full px-auto"
                        variant={"outline"}
                        onClick={handleGoogleSignUp}
                    >
                        <FcGoogle size={26} className="pr-1" /> Google
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
