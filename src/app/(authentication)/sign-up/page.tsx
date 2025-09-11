"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/utilities/auth-utilities/form-input";
import Logo from "@/components/utilities/logo";
import { GoArrowUpRight } from "react-icons/go";
import { authClient } from "../../../../auth-client";
import { useToast } from "@/hooks/use-toast";
import { usernameSchema } from "@/schema/username";
import { useDebounce } from "@/hooks/use-debounce";
import useAuthStore from "@/context/use-auth-store";
import { FcGoogle } from "react-icons/fc";

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
    const { setEmail } = useAuthStore();

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

    useEffect(() => {
        if (!debouncedUsername) {
            setUsernameAvailable(null);
            form.clearErrors("username");
            return;
        }

        async function checkUsername() {
            setChecking(true);
            setUsernameAvailable(null);
            try {
                const res = await fetch(
                    `/api/check-username?username=${debouncedUsername}`
                );
                const data = await res.json();

                if (data.available === 0) {
                    setUsernameAvailable(false);
                    form.setError("username", {
                        type: "manual",
                        message: "Username is already taken",
                    });
                } else if (data.available === 2) {
                    form.setError("username", {
                        type: "manual",
                        message: "Invalid username",
                    });
                } else {
                    form.clearErrors("username");
                }
            } catch (err) {
                console.error(err);
                setUsernameAvailable(null);
            } finally {
                setChecking(false);
            }
        }

        checkUsername();
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

                    router.push("/email-verification");
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
        setPending(true);
        await authClient.signIn.social(
            {
                provider: "google",
                callbackURL: "/",
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onSuccess: () => {
                    toast({
                        title: "Signed in successfully",
                        description: "You have been signed in successfully.",
                    });
                    router.push("/");
                    router.refresh();
                },
                onError: (error) => {
                    toast({
                        title: "Error",
                        description:
                            error.error.message ?? "Something went wrong.",
                        variant: "destructive",
                    });
                    setPending(false);
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="w-full max-w-md mx-4 p-6 bg-white/0 rounded-lg flex flex-col items-center">
                <div className="mb-6 w-full flex flex-col items-center space-y-4">
                    <Logo />
                    <p className="text-md md:text-xl lg:text-xl sm:text-xl">
                        Create an account
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        Enter your details below to create your account and get
                        started.
                    </p>
                </div>

                <div className="w-full">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSignUp)}
                            className="grid gap-4"
                        >
                            {fields.map((f) => (
                                <div key={f.name} className="py-1 relative">
                                    <FormInput
                                        name={f.name}
                                        label={f.label}
                                        placeHolder={f.placeHolder}
                                        type={f.type}
                                        {...(f.name === "username" && {
                                            // Show username availability
                                            suffix: checking
                                                ? "Checking..."
                                                : usernameAvailable === false
                                                ? "Taken"
                                                : usernameAvailable === true
                                                ? "Available"
                                                : "",
                                            suffixClassName:
                                                usernameAvailable === false
                                                    ? "text-red-500"
                                                    : usernameAvailable === true
                                                    ? "text-green-500"
                                                    : "",
                                        })}
                                    />
                                </div>
                            ))}

                            <div className="pt-2">
                                <Button
                                    isLoading={pending}
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        usernameAvailable === false || checking
                                    }
                                >
                                    Sign Up & Verify Email
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="mt-4 w-full flex justify-end">
                    <Button
                        variant="link"
                        onClick={() => router.push("/sign-in")}
                        className="px-0"
                    >
                        Already have an account? Sign In{" "}
                        <GoArrowUpRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="mt-4 w-full flex justify-center">
                    <Button
                        isLoading={pending}
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

export default SignUpPage;
