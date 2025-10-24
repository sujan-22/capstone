"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { IUser, authClient } from "../../../../../../../auth-client";
import AccountInfo from "../../components/account-info";

const emailSchema = z.email("Please enter a valid email address");

const ProfileEmail = ({ currentUser }: { currentUser: IUser }) => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (currentUser?.email) setEmail(currentUser.email);
    }, [currentUser]);

    const hasChanges = email.trim() !== currentUser?.email;

    const updateCustomerEmail = () => {
        setLoading(true);
        setErrorState(null);

        const validation = emailSchema.safeParse(email.trim());
        if (!validation.success) {
            setErrorState(
                validation.error.issues[0]?.message ?? "Invalid email"
            );
            setLoading(false);
            return;
        }

        authClient.changeEmail(
            {
                newEmail: email.trim(),
            },
            {
                onRequest: () => {
                    setLoading(true);
                    setErrorState(null);
                    setSuccessState(false);
                },
                onSuccess: () => {
                    setSuccessState(true);
                    setLoading(false);
                    router.refresh();
                    toast({ description: "Email saved successfully" });
                },
                onError: (error) => {
                    setErrorState(
                        error instanceof Error
                            ? error.message
                            : "Failed to update email."
                    );
                    setLoading(false);
                },
            }
        );
    };

    const clearState = () => {
        setSuccessState(false);
        setErrorState(null);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (hasChanges) updateCustomerEmail();
            }}
            className="w-full overflow-visible space-y-4 md:space-y-6"
        >
            <AccountInfo
                label="Email"
                currentInfo={currentUser.email}
                isSuccess={successState}
                isError={!!errorState}
                clearState={clearState}
                data-testid="account-email-editor"
                isLoading={loading}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    <Input
                        name="email"
                        required
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full sm:w-auto flex-grow"
                        data-testid="email-input"
                    />
                </div>

                {errorState && (
                    <p className="text-red-500 mt-2 text-sm">{errorState}</p>
                )}
            </AccountInfo>
        </form>
    );
};

export default ProfileEmail;
