import { Suspense } from "react";
import SortSidebar from "./components/sort-sidebar";
import LayoutHeader from "@/components/utilities/layout-header";

interface GalleryImagesProps {
    children: React.ReactNode;
}

export default function GalleryImages({ children }: GalleryImagesProps) {
    return (
        <LayoutHeader
            heading="Image Gallery"
            description="Browse through a curated collection of phone case designs.
                    Click on any image to start customizing your own case or
                    explore different styles and inspirations."
        >
            <div className="flex flex-col [@media(min-width:620px)]:flex-row-reverse [@media(min-width:620px)]:space-x-12 [@media(min-width:620px)]:space-y-0 gap-2">
                <aside className="mb-4 [@media(min-width:620px)]:mb-0 space-y-8 m-0">
                    <Suspense>
                        <SortSidebar />
                    </Suspense>
                </aside>
                <div className="flex-1">{children}</div>
            </div>
        </LayoutHeader>
    );
}
