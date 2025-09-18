import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import RemindersOverviewPage from "./components/reminders-overview";

export const metadata: Metadata = {
    title: "REMINDERS | DESIGNMYCASE",
    description:
        "View and manage all your upcoming reminders for your unfinished custom case designs.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user } = await getServerSideSession();
    if (!user || !user.id) {
        return;
    }
    return <RemindersOverviewPage userId={user.id} />;
};

export default Page;
