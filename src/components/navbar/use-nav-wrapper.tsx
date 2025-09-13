import { getServerSideSession } from "@/hooks/use-session";
import Navbar from "./navbar";

export default async function UseNavbarWrapper() {
    const { session, user } = await getServerSideSession();

    return <Navbar session={session} user={user} />;
}
