import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import CustomizeOverview from "./components/customize-overview";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Customise your case",
    description:
        "Create a one-of-a-kind phone case by choosing your device model, selecting materials, colors, and finishes, and uploading or adjusting your own image. Preview your design in real-time before placing your order.",
    keywords: [
        "custom phone case",
        "personalized phone case",
        "design your own case",
        "phone case builder",
        "phone case customization",
        "custom mobile cover",
        "design phone accessories",
    ],
    openGraph: {
        title: "Customise your case · DesignMyCase",
        description:
            "Use our easy-to-use customization tool to design your perfect phone case. Choose your phone model, material, color, finish, and add your own images for a truly personal accessory.",
        type: "website",
        url: "https://sujan-capstone.vercel.app/configure/customize",
    },
    robots: {
        index: false,
        follow: false,
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
        return notFound();
    }
    return <CustomizeOverview user={user} id={id} />;
}
