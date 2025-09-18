import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import FavoriteDesignsPage from "./components/favorite-designs";

export const metadata: Metadata = {
    title: "FAVORITE DESIGNS | DESIGNMYCASE",
    description:
        "Browse and manage your favorite phone case designs to quickly access and order your preferred styles.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user } = await getServerSideSession();
    if (!user) {
        return;
    }
    return <FavoriteDesignsPage user={user} />;
};

export default Page;
