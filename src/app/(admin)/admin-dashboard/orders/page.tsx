import React, { Suspense } from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import OrdersOverview from "./components/orders-overview";
import { AdminOrdersInfo } from "./components/info";
import AdminPageHeader from "../components/page-header";

export default async function Page() {
    const { user } = await getServerSideSession();

    if (!user) {
        return notFound();
    }
    return (
        <div className="space-y-8">
            <AdminPageHeader
                eyebrow="02 · Orders"
                title="Orders"
                description="Every order from payment to doorstep. Move cases through production and publish designs customers asked to share."
                guide={<AdminOrdersInfo />}
            />
            <Suspense>
                <OrdersOverview user={user} />
            </Suspense>
        </div>
    );
}
