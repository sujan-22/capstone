import React from "react";
import { Metadata } from "next";
import GalleryImagesPreview from "./components/gallery-images-preview";
import { getServerSideSession } from "@/hooks/use-session";

export const metadata: Metadata = {
    title: "Gallery Images | DESIGNMYCASE",
    description:
        "Browse through our exclusive gallery of custom phone case designs. Get inspired by community creations and start designing your own personalized phone case today.",
    keywords: [
        "custom phone case gallery",
        "DESIGNMYCASE images",
        "personalized case designs",
        "custom case inspiration",
        "unique phone case ideas",
        "gallery of phone cases",
    ],
    openGraph: {
        title: "Gallery Images | DESIGNMYCASE",
        description:
            "Explore a gallery of creative and trending custom phone case designs made by our users. Discover ideas and design your own unique case.",
        type: "website",
        url: "https://sujan-capstone.vercel.app/gallery-images",
        images: [
            {
                url: "https://sujan-capstone.vercel.app/og/gallery-images.png",
                width: 1200,
                height: 630,
                alt: "Gallery of custom phone case designs on DESIGNMYCASE",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Gallery Images | DESIGNMYCASE",
        description:
            "Discover custom phone case designs from the DESIGNMYCASE community. Get inspired and create your personalized design today.",
        images: ["https://sujan-capstone.vercel.app/og/gallery-images.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Page() {
    const { user } = await getServerSideSession();
    return <GalleryImagesPreview userId={user?.id} />;
}
