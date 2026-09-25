import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import CustomersOverview from "./components/customers-overview";
import { AdminCustomersInfo } from "./components/info";
import AdminPageHeader from "../components/page-header";

export default async function Page() {
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return (
        <div className="space-y-8">
            <AdminPageHeader
                eyebrow="03 · Customers"
                title="Customers"
                description="Everyone with an account: what they've ordered and spent, and their access. Ban, promote or remove accounts from each row."
                guide={<AdminCustomersInfo />}
            />
            <CustomersOverview user={user} />
        </div>
    );
}
