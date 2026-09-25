import React from "react";
import AccountOverview from "./components/account-overview";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Account",
    description:
        "Manage your account details, view your profile, and access your order history with DESIGNMYCASE.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user, session } = await getServerSideSession();
    if (!user || !session) {
        redirect("/sign-in");
    }
    return <AccountOverview user={user} session={session} />;
};

export default Page;
