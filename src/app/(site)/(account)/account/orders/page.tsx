import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import OrdersPage from "./components/orders-page";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Orders",
    description:
        "View and manage your past phone case orders. Track order status, view details, and reorder your favorite designs.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user } = await getServerSideSession();
    if (!user || !user.id) {
        notFound();
    }
    return <OrdersPage userId={user.id} />;
};

export default Page;
