import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import OrdersPage from "./components/orders-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ORDERS | DESIGNMYCASE",
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
        return;
    }
    return <OrdersPage userId={user.id} />;
};

export default Page;
