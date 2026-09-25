"use client";

import React, { useEffect, useState } from "react";
import { safeRedirect } from "@/lib/utils";
import AuthHeading from "../../components/auth-heading";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import { authClient } from "../../../../../auth-client";
import { useToast } from "@/hooks/use-toast";
import { usernameSchema } from "@/schema/username";
import { useDebounce } from "@/hooks/use-debounce";
import useAuthStore from "@/context/use-auth-store";
import { FcGoogle } from "react-icons/fc";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";

const signUpSchema = z
    .object({
        username: usernameSchema,
        email: z.string().email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpValues = z.infer<typeof signUpSchema>;

const fields = [
    {
        name: "username",
        label: "Username",
        placeHolder: "your username",
        type: "text",
    },
    {
        name: "email",
        label: "Email",
        placeHolder: "your-email@example.com",
        type: "email",
    },
    {
        name: "password",
        label: "Password",
        placeHolder: "********",
        type: "password",
    },
    {
        name: "confirmPassword",
        label: "Confirm Password",
        placeHolder: "confirm password",
        type: "password",
    },
];

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [pending, setPending] = useState(false);
    const searchParams = useSearchParams();
    const { setEmail } = useAuthStore();

    const [redirectTo, setRedirectTo] = useState("/");

    useEffect(() => {
        const params = searchParams.get("redirectTo");
        if (params) setRedirectTo(safeRedirect(params));
    }, [searchParams]);

    const form = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const username = form.watch("username");
    const debouncedUsername = useDebounce(username, 500);

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
        null
    );
    const [checking, setChecking] = useState(false);
    const password = form.watch("password");
    const strength = usePasswordStrength(password);

    useEffect(() => {
        if (!debouncedUsername) {
            setUsernameAvailable(null);
            form.clearErrors("username");
            return;
        }

        let cancelled = false;
        setChecking(true);
        setUsernameAvailable(null);

        (async () => {
            try {
                const { data, error } = await authClient.isUsernameAvailable({
                    username: debouncedUsername,
                });

                if (cancelled) return;

                if (error) {
                    console.error("isUsernameAvailable error:", error);
                    setUsernameAvailable(null);
                    return;
                }

                const available = Boolean(data?.available);
                setUsernameAvailable(available);

                if (!available) {
                    form.setError("username", {
                        type: "manual",
                        message: "Username is already taken",
                    });
                } else {
                    form.clearErrors("username");
                }
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    setUsernameAvailable(null);
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [debouncedUsername, form]);

    const handleSignUp = async (values: SignUpValues) => {
        if (usernameAvailable === false) {
            toast({
                title: "Username taken",
                description: "Please choose another username.",
            });
            return;
        }

        setPending(true);
        await authClient.signUp.email(
            {
                email: values.email,
                password: values.password,
                username: values.username,
                name: values.username,
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onSuccess: () => {
                    setEmail(values.email);
                    toast({
                        title: "Account created",
                        description:
                            "Your account has been created. Please check your email for a verification code.",
                    });

                    router.push(
                        `/email-verification?redirectTo=${encodeURIComponent(
                            redirectTo
                        )}`
                    );
                },
                onError: (error) => {
                    toast({
                        title: "Error",
                        description:
                            error.error.message ?? "Something went wrong.",
                    });
                    setPending(false);
                },
            }
        );
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
                eyebrow="New here"
                title="Create an account"
                description="Save designs, track orders and pick up unfinished cases later. We'll email you a code to verify your address."
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSignUp)}
                    className="grid gap-5"
                >
                    {fields.map((f) => (
                        <div key={f.name}>
                            <FormInput
                                name={f.name}
                                label={f.label}
                                placeHolder={f.placeHolder}
                                type={f.type}
                                autoComplete={
                                    f.name === "username"
                                        ? "username"
                                        : f.name === "email"
                                        ? "email"
                                        : "new-password"
                                }
                                {...(f.name === "username" && {
                                    suffix: checking
                                        ? "Checking…"
                                        : usernameAvailable === false
                                        ? "Taken"
                                        : usernameAvailable === true
                                        ? "Available"
                                        : "",
                                    suffixClassName:
                                        usernameAvailable === false
                                            ? "text-destructive"
                                            : usernameAvailable === true
                                            ? "text-success"
                                            : "",
                                })}
                            />
                            {f.name === "password" && (
                                <PasswordStrengthMeter password={password} />
                            )}
                        </div>
                    ))}

                    <Button
                        isLoading={pending}
                        type="submit"
                        size="lg"
                        className="mt-1 w-full"
                        disabled={
                            usernameAvailable === false ||
                            checking ||
                            strength.score < 2
                        }
                    >
                        Create account &amp; verify email
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
                Already have an account?{" "}
                <Link
                    href={`/sign-in?redirectTo=${encodeURIComponent(
                        redirectTo
                    )}`}
                    className="font-semibold text-cobalt underline-offset-4 hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </>
    );
};

export default SignUpPage;
