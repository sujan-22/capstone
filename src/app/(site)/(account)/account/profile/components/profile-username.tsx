"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AccountInfo from "../../components/account-info";
import { authClient, IUser } from "../../../../../../../auth-client";
import { usernameSchema } from "@/schema/username";
import { useDebounce } from "@/hooks/use-debounce";

const ProfileUsername = ({ currentUser }: { currentUser: IUser }) => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const debouncedUsername = useDebounce(username, 500);

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
        null
    );
    const [checking, setChecking] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!debouncedUsername) {
            setUsernameAvailable(null);
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
                    setErrorState("Username is already taken");
                } else if (data.available === 2) {
                    setErrorState("Invalid username");
                } else {
                    setErrorState("");
                }
            } catch (err) {
                console.error(err);
                setUsernameAvailable(null);
            } finally {
                setChecking(false);
            }
        }

        checkUsername();
    }, [debouncedUsername, username]);

    useEffect(() => {
        if (currentUser?.username || currentUser?.displayUsername) {
            setUsername(
                currentUser.username || currentUser.displayUsername || ""
            );
        }
    }, [currentUser]);

    const hasChanges = username.trim() !== currentUser?.name;

    const updateUsername = async () => {
        if (usernameAvailable === false) {
            toast({
                title: "Username taken",
                description: "Please choose another username.",
            });
            return;
        }
        setLoading(true);
        setErrorState(null);
        usernameSchema.parse(username.trim());

        await authClient.updateUser(
            { username: username.trim() },
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
                    toast({ description: "Username updated successfully." });
                },
                onError: (error) => {
                    setErrorState(
                        error instanceof Error
                            ? error.message
                            : "Failed to update username."
                    );
                    setLoading(false);
                },
            }
        );
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
                isLoading={loading || checking}
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
