"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ProfileName from "./profile-name";
import ProfilePassword from "./profile-password";
import ProfileUsername from "./profile-username";
import { authClient, IUser } from "../../../../../../../auth-client";

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
import { MdDelete } from "react-icons/md";
import AccountHeader from "../../components/account-header";

export default function AccountProfilePage({ user }: { user: IUser }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null);

    useEffect(() => {
        const method = authClient.getLastUsedLoginMethod() ?? null;
        setLastLoginMethod(method);
    }, []);

    const showPassword = lastLoginMethod === "email";

    const handleConfirmDelete = async () => {
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

    return (
        <div>
            <AccountHeader
                heading="Profile"
                description="Your name, username and password. Changes apply everywhere you sign in."
            />

            <div className="flex w-full flex-col">
                <ProfileName currentUser={user} />
                <ProfileUsername currentUser={user} />
                {showPassword && <ProfilePassword />}
            </div>

            <section
                aria-labelledby="danger-heading"
                className="mt-12 flex flex-col gap-4 rounded-md border border-destructive/30 bg-destructive/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h3 id="danger-heading" className="type-heading">
                        Delete your account
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm text-ink-soft">
                        Permanently removes your account, saved designs and
                        favourites. This can&rsquo;t be undone.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="shrink-0 border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/5"
                            icon={MdDelete}
                        >
                            Delete account
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
                                    {isDeleting ? "Deleting..." : "Delete my account"}
                                </span>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </section>
        </div>
    );
}
