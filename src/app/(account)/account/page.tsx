import React from "react";
import AccountOverview from "./components/account-overview";
import { getServerSideSession } from "@/hooks/use-session";

const Page = async () => {
    const { user, session } = await getServerSideSession();
    return <AccountOverview user={user} session={session} />;
};

export default Page;
