import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import ImageGalleryComponent from "./image-gallery-component";

const RenderImageGallery = async () => {
    const { user } = await getServerSideSession();
    return <ImageGalleryComponent userId={user?.id} />;
};

export default RenderImageGallery;
