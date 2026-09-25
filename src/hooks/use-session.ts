import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "../../auth";

// Deduped per request: the header, page and sections can all ask for the
// session without each one hitting the auth API.
export const getServerSideSession = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return {
        session: session?.session || null,
        user: session?.user,
    };
});
