import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import FeaturedDesigns from "./featured-designs";

const RenderFeaturedDesigns = async () => {
    const { user } = await getServerSideSession();
    return <FeaturedDesigns user={user} />;
};

export default RenderFeaturedDesigns;
