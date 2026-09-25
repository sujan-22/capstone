import React, { Suspense } from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import ThankyouComponent from "./components/thank-you";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Order confirmed",
    description:
        "Thank you for your order! Your custom phone case is being processed. View your order details and track its status with DESIGNMYCASE.",
    keywords: [
        "order confirmation",
        "thank you page",
        "custom phone case order",
        "DESIGNMYCASE checkout",
        "order complete",
        "custom phone cover purchase",
    ],
    openGraph: {
        title: "Order confirmed · DesignMyCase",
        description:
            "Your order has been successfully placed! Thank you for choosing DESIGNMYCASE. Track your order and stay updated on its progress.",
        type: "website",
        url: "https://sujan-capstone.vercel.app/thank-you",
    },
    twitter: {
        card: "summary_large_image",
        title: "Order confirmed · DesignMyCase",
        description:
            "Your custom phone case order is confirmed! Thank you for shopping with DESIGNMYCASE.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default async function Page({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const { user } = await getServerSideSession();
    if (!user) {
        notFound();
    }

    return (
        <MaxWidthWrapper>
            <Suspense>
                <ThankyouComponent user={user} orderId={orderId} />
            </Suspense>
        </MaxWidthWrapper>
    );
}
