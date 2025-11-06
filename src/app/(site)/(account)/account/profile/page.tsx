import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import AccountProfilePage from "./components/profile";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "PROFILE | DESIGNMYCASE",
    description:
        "Update your profile information to personalize your shopping experience.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return <AccountProfilePage user={user} />;
};

export default Page;
