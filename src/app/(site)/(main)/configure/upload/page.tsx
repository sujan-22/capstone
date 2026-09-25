import React from "react";
import UploadScreen from "./components/upload-screen";
import { Metadata } from "next";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Upload your photo",
    description:
        "Upload your image to begin designing your custom phone case. Supported formats: PNG, JPG, and JPEG (max size: 10MB). Start personalizing your case today.",
    robots: {
        index: false,
        follow: true,
    },
};

const Page = async () => {
    const { user } = await getServerSideSession();

    if (!user) {
        notFound();
    }

    return <UploadScreen userId={user.id} />;
};

export default Page;
