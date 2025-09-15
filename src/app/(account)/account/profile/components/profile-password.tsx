"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { authClient } from "../../../../../../auth-client";
import AccountInfo from "../../components/account-info";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { usePasswordStrength } from "@/hooks/use-password-strength";

const profileFormSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

const ProfilePassword = () => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const { toast } = useToast();

    const strength = usePasswordStrength(newPassword);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Validate new password with Zod
        const validation = profileFormSchema.safeParse({
            password: newPassword,
        });
        if (!validation.success) {
            setErrorState(
                validation.error.issues[0]?.message ?? "Invalid password"
            );
            return;
        }

        authClient.changePassword(
            {
                newPassword,
                currentPassword,
                revokeOtherSessions: true,
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
                    toast({ description: "Password updated successfully" });
                    setCurrentPassword("");
                    setNewPassword("");
                },
                onError: (error) => {
                    setErrorState(
                        error instanceof Error
                            ? error.message
                            : "Failed to update password."
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
        <form onSubmit={handleSubmit} className="w-full overflow-visible">
            <AccountInfo
                label="Password"
                currentInfo="The password is not shown for security reasons."
                isSuccess={successState}
                isError={!!errorState}
                clearState={clearState}
                isLoading={loading}
                disabled={strength.score < 2}
            >
                <div className="mb-1">
                    <p className="text-sm text-muted-foreground">
                        Current Password
                    </p>
                    <Input
                        name="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading}
                        data-testid="current-password-input"
                    />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">
                        New Password
                    </p>
                    <Input
                        name="password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        data-testid="new-password-input"
                    />
                    <PasswordStrengthMeter password={newPassword} />
                </div>
                {errorState && (
                    <p className="text-red-500 mt-2">{errorState}</p>
                )}
            </AccountInfo>
        </form>
    );
};

export default ProfilePassword;
