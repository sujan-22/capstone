"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { authClient } from "../../../../../../auth-client";
import AccountInfo from "../../components/account-info";

// Password validation schema
const profileFormSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .optional(),
});

const ProfilePassword = () => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const { toast } = useToast();

    // Function to validate the form
    const validatePassword = (newPassword: string) => {
        try {
            profileFormSchema.parse({ password: newPassword });
            return null; // Return null if no errors
        } catch (error) {
            if (error instanceof z.ZodError) {
            }
            return "An unexpected error occurred.";
        }
    };

    const updateCustomerPassword = async () => {
        setLoading(true);
        setErrorState(null);
        try {
            await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true,
            });
            setSuccessState(true);
            toast({ description: `Password updated successfully` });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error updating password:", error);
            setErrorState(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Validate the new password before submitting
        const validationError = validatePassword(newPassword);
        if (validationError) {
            setErrorState(validationError);
            return;
        }

        updateCustomerPassword();
    };

    const clearState = () => {
        setSuccessState(false);
        setErrorState(null);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full overflow-visible">
            <AccountInfo
                label="Password"
                currentInfo={"The password is not shown for security reasons."}
                isSuccess={successState}
                isError={!!errorState}
                clearState={clearState}
                data-testid="account-password-editor"
                isLoading={loading}
            >
                <div className="mb-1">
                    <p className="text-sm text-muted-foreground">
                        Current Password
                    </p>
                    <Input
                        name="current-password"
                        type="password"
                        required
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading}
                        data-testid="current-password-input"
                    />
                </div>
                <div className="">
                    <p className="text-sm text-muted-foreground">
                        New Password
                    </p>
                    <Input
                        name="password"
                        type="password"
                        required
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        data-testid="new-password-input"
                    />
                </div>
                {errorState && (
                    <p className="text-red-500 mt-2">{errorState}</p>
                )}
            </AccountInfo>
        </form>
    );
};

export default ProfilePassword;
