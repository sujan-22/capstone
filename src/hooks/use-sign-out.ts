"use client";

import { useRouter } from "next/navigation";
import { authClient } from "../../auth-client";
import { useToast } from "./use-toast";

export function useSignOut() {
    const router = useRouter();
    const { toast } = useToast();
    const signOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.refresh();
                    },
                },
            });
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
            });
            router.push("/");
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "There was an error signing out. Please try again.",
                variant: "destructive",
            });
            console.error("Error signing out:", error);
        }
    };

    return { signOut };
}
