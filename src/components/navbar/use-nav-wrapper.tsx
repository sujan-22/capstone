import { getServerSideSession } from "@/hooks/use-session";
import Navbar from "./navbar";

export default async function UseNavbarWrapper() {
    const { user } = await getServerSideSession();

    return <Navbar user={user} />;
}
