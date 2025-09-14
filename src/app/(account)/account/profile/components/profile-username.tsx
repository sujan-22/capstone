"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AccountInfo from "../../components/account-info";
import { authClient, IUser } from "../../../../../../auth-client";
import { z } from "zod";
import { usernameSchema } from "@/schema/username";

const ProfileUsername = ({ currentUser }: { currentUser: IUser }) => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (currentUser?.username || currentUser?.displayUsername) {
            setUsername(
                currentUser.username || currentUser.displayUsername || ""
            );
        }
    }, [currentUser]);

    const hasChanges = username.trim() !== currentUser?.name;

    const updateUsername = async () => {
        setLoading(true);
        setErrorState(null);

        try {
            usernameSchema.parse(username.trim());

            await authClient.updateUser({ username: username.trim() });

            setSuccessState(true);
            router.refresh();
            toast({ description: "Username updated successfully" });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                setErrorState(error.issues[0]?.message ?? "Invalid username");
            } else if (error instanceof Error) {
                setErrorState(error.message);
            } else {
                setErrorState("Failed to update username.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (hasChanges) {
            updateUsername();
        }
    };

    const clearState = () => {
        setSuccessState(false);
        setErrorState(null);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full overflow-visible">
            <AccountInfo
                label="Username"
                currentInfo={
                    currentUser?.username || currentUser?.displayUsername || ""
                }
                isSuccess={successState}
                isError={!!errorState}
                clearState={clearState}
                isLoading={loading}
            >
                <Input
                    name="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />
                {errorState && (
                    <p className="text-red-500 mt-2">{errorState}</p>
                )}
            </AccountInfo>
        </form>
    );
};

export default ProfileUsername;
