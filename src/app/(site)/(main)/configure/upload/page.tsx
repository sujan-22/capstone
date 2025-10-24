import React from "react";
import UploadComponent from "./components/upload";
import { Metadata } from "next";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "IMAGE UPLOAD | DESIGNMYCASE",
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

    return (
        <div className="h-[70vh]">
            <UploadComponent userId={user.id} />
        </div>
    );
};

export default Page;
