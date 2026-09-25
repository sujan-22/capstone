import React from "react";
import { Metadata } from "next";
import GalleryImagesPreview from "./components/gallery-images-preview";
import { getServerSideSession } from "@/hooks/use-session";

export const metadata: Metadata = {
    title: "Image gallery",
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
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Page() {
    const { user } = await getServerSideSession();
    return <GalleryImagesPreview userId={user?.id} />;
}
