"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AccountInfo from "../../components/account-info";
import { authClient, IUser } from "../../../../../../auth-client";
import { z } from "zod";

const nameSchema = z.object({
    fname: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(15, "First name must be at most 15 characters")
        .regex(
            /^[a-zA-Z'-]+$/,
            "First name can only contain letters, apostrophes, and hyphens"
        ),
    lname: z
        .string()
        .max(15, "Last name must be at most 15 characters")
        .regex(
            /^[a-zA-Z'-]*$/,
            "Last name can only contain letters, apostrophes, and hyphens"
        )
        .optional(),
});

const ProfileName = ({ currentUser }: { currentUser: IUser }) => {
    const [successState, setSuccessState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (currentUser?.name) {
            const parts = currentUser.name.split(" ");
            setFname(parts[0] || "");
            setLname(parts.slice(1).join(" ") || "");
        }
    }, [currentUser]);

    const hasChanges = `${fname} ${lname}`.trim() !== currentUser?.name;

    const updateCustomerName = async () => {
        setLoading(true);
        setErrorState(null);

        try {
            nameSchema.parse({ fname, lname });

            const newName = [fname, lname].filter(Boolean).join(" ").trim();
            await authClient.updateUser({ name: newName });

            setSuccessState(true);
            router.refresh();
            toast({ description: "Name saved successfully" });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                setErrorState(error.issues[0]?.message ?? "Invalid name");
            } else if (error instanceof Error) {
                setErrorState(error.message);
            } else {
                setErrorState("Failed to update name.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (hasChanges) {
            updateCustomerName();
        }
    };

    const clearState = () => {
        setSuccessState(false);
        setErrorState(null);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full overflow-visible">
            <AccountInfo
                label="Name"
                currentInfo={currentUser?.name || ""}
                isSuccess={successState}
                isError={!!errorState}
                clearState={clearState}
                isLoading={loading}
            >
                <div className="flex gap-2">
                    <Input
                        name="fname"
                        placeholder="First Name"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        disabled={loading}
                    />
                    <Input
                        name="lname"
                        placeholder="Last Name (optional)"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        disabled={loading}
                    />
                </div>
                {errorState && (
                    <p className="text-red-500 mt-2">{errorState}</p>
                )}
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
