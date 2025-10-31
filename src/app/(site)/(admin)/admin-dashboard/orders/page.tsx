import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import OrdersOverview from "./components/orders-overview";

export default async function Page() {
    const { user } = await getServerSideSession();

    if (!user) {
        return notFound();
    }
    return <OrdersOverview user={user} />;
}
