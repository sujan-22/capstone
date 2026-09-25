import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import AccountProfilePage from "./components/profile";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_noStore } from "next/cache";

export const metadata: Metadata = {
    title: "Profile",
    description:
        "Update your profile information to personalize your shopping experience.",
    robots: {
        index: false,
        follow: true,
    },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Page = async () => {
    unstable_noStore();
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return <AccountProfilePage user={user} />;
};

export default Page;
