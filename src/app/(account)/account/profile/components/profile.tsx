"use client";

import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ProfileName from "./profile-name";
import ProfileEmail from "./profile-email";
import ProfilePassword from "./profile-password";
import ProfileUsername from "./profile-username";
import { authClient, IUser } from "../../../../../../auth-client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountProfilePage({
    user,
}: {
    user: IUser | undefined;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!user || !user.id) {
            toast({
                title: "Unable to delete account",
                description: "No user session found.",
                variant: "destructive",
            });
            return;
        }

        await authClient.deleteUser(
            {},
            {
                onRequest: () => setIsDeleting(true),
                onSuccess: () => {
                    toast({
                        title: "Account deleted",
                        description:
                            "Your account has been deleted successfully.",
                    });
                    setTimeout(() => router.refresh(), 800);
                },
                onError: (err) => {
                    console.error("Failed to delete account:", err);
                    toast({
                        title: "Delete failed",
                        description:
                            (err && err.error.message) ||
                            "Something went wrong while deleting your account.",
                        variant: "destructive",
                    });
                },
                onSettled: () => setIsDeleting(false),
            }
        );
    };

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="text-center sm:text-left">
                <h3 className="text-2xl font-semibold">Your Profile</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Update your profile information to personalize your shopping
                    experience.
                </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-y-8 w-full">
                <ProfileName currentUser={user} />
                <Separator />
                <ProfileUsername currentUser={user} />
                <Separator />
                <ProfileEmail currentUser={user} />
                <Separator />
                <ProfilePassword />
                <Separator />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size={"sm"}
                            className="text-red-500 w-fit"
                            variant={"outline"}
                        >
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                                Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                                onClick={async () => {
                                    await handleConfirmDelete();
                                }}
                                disabled={isDeleting}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {isDeleting ? "Deleting..." : "Continue"}
                                </span>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
