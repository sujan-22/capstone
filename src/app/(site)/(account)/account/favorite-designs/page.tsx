import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import FavoriteDesignOverview from "./components/favorite-designs-overview";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Favourites",
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
        return notFound();
    }
    return <FavoriteDesignOverview userId={user.id} />;
};

export default Page;
