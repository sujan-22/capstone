"use client";

import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
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
import { User } from "lucide-react";

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
        <div className="space-y-6">
            <AccountHeader
                heading="Your Profile"
                description="Update your profile information to personalize your shopping
                    experience."
                icon={User}
            />

            <div className="flex flex-col gap-y-8 w-full">
                <ProfileName currentUser={user} />
                <Separator />
                <ProfileUsername currentUser={user} />
                <Separator />
                {/* <ProfileEmail currentUser={user} />
                <Separator /> */}
                {showPassword && (
                    <>
                        <ProfilePassword />
                        <Separator />
                    </>
                )}

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size={"sm"}
                            className="text-red-500 w-fit"
                            variant={"outline"}
                            icon={MdDelete}
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
