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
        if (params) setRedirectTo(safeRedirect(params));
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
        <>
            <AuthHeading
                eyebrow="Welcome back"
                title="Sign in"
                description="Enter your username and password to pick up where you left off."
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSignUp)}
                    className="grid gap-5"
                >
                    {fields.map((f) => (
                        <FormInput
                            key={f.name}
                            name={f.name}
                            label={f.label}
                            placeHolder={f.placeHolder}
                            type={f.type}
                            autoComplete={
                                f.name === "password"
                                    ? "current-password"
                                    : "username"
                            }
                        />
                    ))}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember-me"
                                checked={remember}
                                onCheckedChange={(val) =>
                                    setRemember(Boolean(val))
                                }
                            />
                            <Label htmlFor="remember-me" className="text-sm">
                                Remember me
                            </Label>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-cobalt underline-offset-4 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        isLoading={pending}
                        type="submit"
                        size="lg"
                        className="mt-1 w-full"
                    >
                        Sign in
                    </Button>
                </form>
            </Form>

            <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-rule" />
                <span className="type-label text-ink-soft">or</span>
                <span className="h-px flex-1 bg-rule" />
            </div>

            <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={handleGoogleSignUp}
            >
                <FcGoogle size={20} aria-hidden /> Continue with Google
            </Button>

            <p className="mt-8 text-center text-sm text-ink-soft">
                New to DesignMyCase?{" "}
                <Link
                    href={`/sign-up?redirectTo=${encodeURIComponent(
                        redirectTo
                    )}`}
                    className="font-semibold text-cobalt underline-offset-4 hover:underline"
                >
                    Create an account
                </Link>
            </p>
        </>
    );
};

export default SignInPage;
