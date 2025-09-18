import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import UnfinishedDesignsOverviewPage from "./components/unfinished-designs-overview";

export const metadata: Metadata = {
    title: "UNFINISHED DESIGNS | DESIGNMYCASE",
    description:
        "Manage your unfinished custom phone case designs and view upcoming reminders to complete them.",
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
    return <UnfinishedDesignsOverviewPage userId={user.id} />;
};

export default Page;
