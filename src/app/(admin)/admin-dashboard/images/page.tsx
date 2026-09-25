import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import ImagesOverview from "./components/images-overview";
import { AdminImagesInfo } from "./components/info";
import AdminPageHeader from "../components/page-header";
import AddImageAction from "./components/add-image-action";

export default async function Page() {
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return (
        <div className="space-y-8">
            <AdminPageHeader
                eyebrow="05 · Images"
                title="Images"
                description="The gallery customers can start a case from. Switch an image off to hide it without breaking designs that already use it."
                actions={<AddImageAction />}
                guide={<AdminImagesInfo />}
            />
            <ImagesOverview />
        </div>
    );
}
