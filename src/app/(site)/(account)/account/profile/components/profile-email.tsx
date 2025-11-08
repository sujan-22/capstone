"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { IUser, authClient } from "../../../../../../../auth-client";
import AccountInfo from "../../components/account-info";
import EmailOtpDialog from "./email-otp-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeEmail as changeEmailRequest } from "../actions/actions";

export const emailSchema = z.email("Please enter a valid email address");

const ProfileEmail = ({ currentUser }: { currentUser: IUser }) => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [showOtp, setShowOtp] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [email, setEmail] = useState("");
    const router = useRouter();
    const { toast } = useToast();
    const qc = useQueryClient();

    useEffect(() => {
        if (currentUser?.email) setEmail(currentUser.email);
    }, [currentUser]);

    const hasChanges = email.trim() !== currentUser?.email;

    const mutation = useMutation({
        mutationFn: (newEmail: string) => changeEmailRequest(newEmail),
        onMutate: async (newEmail) => {
            setErrorState(null);
            setSuccessState(false);
            setPendingEmail(newEmail.trim());
        },
        onSuccess: async (res) => {
            if (res.success) {
                setShowOtp(true);
                setSuccessState(true);
                toast({
                    description:
                        "We sent a code to your new email. Enter the 6-digit code to verify.",
                });
                await qc.invalidateQueries();
            } else {
                setErrorState(res.error || "Failed to update email.");
            }
        },
        onError: (err: unknown) => {
            setErrorState(
                err instanceof Error ? err.message : "Failed to update email."
            );
        },
    });

    const updateCustomerEmail = () => {
        const validation = emailSchema.safeParse(email.trim());
        if (!validation.success) {
            setErrorState(
                validation.error.issues[0]?.message ?? "Invalid email"
            );
            return;
        }
        mutation.mutate(email.trim());
    };

    const clearState = () => {
        setSuccessState(false);
        setErrorState(null);
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (hasChanges && !mutation.isPending)
                        updateCustomerEmail();
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
                    isLoading={mutation.isPending}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <Input
                            name="email"
                            required
                            value={email}
                            disabled={mutation.isPending}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full sm:w-auto flex-grow"
                            data-testid="email-input"
                        />
                    </div>

                    {errorState && (
                        <p className="text-red-500 mt-2 text-sm">
                            {errorState}
                        </p>
                    )}
                </AccountInfo>
            </form>

            <EmailOtpDialog
                open={showOtp}
                onOpenChange={setShowOtp}
                email={pendingEmail}
                onVerified={async () => {
                    const session = await authClient.getSession();
                    const newEmail = session?.data?.user?.email || "";
                    setEmail(newEmail);
                    setShowOtp(false);
                    router.refresh();
                    await qc.invalidateQueries();
                }}
            />
        </>
    );
};

export default ProfileEmail;
