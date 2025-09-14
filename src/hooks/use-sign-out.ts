"use client";

import { useRouter } from "next/navigation";
import { authClient } from "../../auth-client";
import { useToast } from "./use-toast";

export function useSignOut() {
    const router = useRouter();
    const { toast } = useToast();
    const signOut = async () => {
        try {
            await authClient.signOut({});
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "There was an error signing out. Please try again.",
                variant: "destructive",
            });
            console.error("Error signing out:", error);
        }

        router.replace("/");
        router.refresh();
    };

    return { signOut };
}
