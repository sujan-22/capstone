import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { Metadata } from "next";
import OrderDetailsPage from "./components/order-details";

export const metadata: Metadata = {
    title: "Order details",
    description:
        "View detailed information about your order, including the case design, model, color, material, finish, and shipping details on DESIGNMYCASE.",
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
        return;
    }
    return <OrderDetailsPage user={user} orderId={orderId} />;
}
