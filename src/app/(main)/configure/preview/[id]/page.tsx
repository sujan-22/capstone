import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import DesignPreviewOverview from "./components/design-preview-overview";

export const metadata: Metadata = {
    title: "Preview Your Custom Phone Case | DESIGNMYCASE",
    description:
        "Review your personalized phone case before checkout. Preview your selected phone model, material, finish, color, and adjusted image to ensure your design is perfect.",
    keywords: [
        "phone case preview",
        "custom phone case checkout",
        "personalized phone case",
        "design confirmation",
        "custom case design preview",
        "review custom phone cover",
    ],
    openGraph: {
        title: "Preview Your Custom Phone Case | DESIGNMYCASE",
        description:
            "See a live preview of your personalized phone case before placing your order. Confirm your phone model, material, color, finish, and uploaded image design.",
        type: "website",
        url: "https://sujan-capstone.vercel.app/configure/preview",
    },
    twitter: {
        card: "summary_large_image",
        title: "Preview Your Custom Phone Case | DESIGNMYCASE",
        description:
            "Confirm your custom phone case design before checkout — review model, material, finish, color, and uploaded image.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { user } = await getServerSideSession();
    if (!user) {
        return;
    }
    return <DesignPreviewOverview user={user} id={id} />;
}
