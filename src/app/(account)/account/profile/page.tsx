import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import AccountProfilePage from "./components/profile";

const Page = async () => {
    const { user } = await getServerSideSession();
    return <AccountProfilePage user={user} />;
};

export default Page;
