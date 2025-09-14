"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IUser } from "../../../../../../auth-client";
import ProfileName from "./profile-name";
import ProfileEmail from "./profile-email";
import ProfilePassword from "./profile-password";
import ProfileUsername from "./profile-username";

export default function AccountProfilePage({
    user,
}: {
    user: IUser | undefined;
}) {
    const handleDeleteAccount = async () => {};

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Update your profile information to personalize your shopping
                    experience.
                </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-y-8 w-full">
                <ProfileName currentUser={user!} />
                <Separator />
                <ProfileUsername currentUser={user!} />
                <Separator />
                <ProfileEmail currentUser={user!} />
                <Separator />
                <ProfilePassword />
                <Separator />
                <Button
                    className="w-[20%] text-red-500"
                    variant={"outline"}
                    onClick={handleDeleteAccount}
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
