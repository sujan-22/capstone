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
    openGraph: {
        title: "Featured Designs | DESIGNMYCASE",
        description:
            "Discover trending and featured phone case designs made by our users. Browse, favorite, and create your own personalized design.",
        type: "website",
        url: "https://sujan-capstone.vercel.app/featured-designs",
        images: [
            {
                url: "https://sujan-capstone.vercel.app/og/featured-designs.png", // optional preview image
                width: 1200,
                height: 630,
                alt: "Featured custom phone case designs on DESIGNMYCASE",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Featured Designs | DESIGNMYCASE",
        description:
            "Explore our most popular and trending custom phone case designs created by our community.",
        images: ["https://sujan-capstone.vercel.app/og/featured-designs.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Page() {
    const { user } = await getServerSideSession();
    return <FeaturedDesigns user={user} />;
}
