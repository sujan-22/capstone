import { Suspense } from "react";
import SortSidebar from "./components/sort-sidebar";
import LayoutHeader from "@/components/utilities/layout-header";

interface GalleryImagesProps {
    children: React.ReactNode;
}

export default function GalleryImages({ children }: GalleryImagesProps) {
    return (
        <LayoutHeader
            eyebrow="Image gallery"
            heading="Pick a photo, make it a case."
            description="A curated collection of images ready to print. Choose one and we'll set up a case design with it, ready for you to place and customise."
            aside={
                <Suspense>
                    <SortSidebar />
                </Suspense>
            }
        >
            {children}
        </LayoutHeader>
    );
}
