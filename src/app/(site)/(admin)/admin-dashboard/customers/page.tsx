import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import CustomersOverview from "./components/customers-overview";

export default async function Page() {
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return <CustomersOverview user={user} />;
}
