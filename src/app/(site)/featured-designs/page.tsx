import React from "react";
import { Metadata } from "next";
import FeaturedDesigns from "./components/featured-designs";
import { getServerSideSession } from "@/hooks/use-session";

export const metadata: Metadata = {
    title: "Featured Designs | DESIGNMYCASE",
    description:
        "Explore our most popular and trending custom phone case designs, created and shared by our community. Get inspired and customize your own case today.",
    keywords: [
        "featured phone case designs",
        "popular custom cases",
        "trending phone covers",
        "DESIGNMYCASE gallery",
        "custom case inspiration",
        "best phone case designs",
    ],
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Page() {
    const { user } = await getServerSideSession();
    return <FeaturedDesigns user={user} />;
}
