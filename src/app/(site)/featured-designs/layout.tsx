import SortSidebar from "./components/sort-sidebar";
import { Suspense } from "react";
import LayoutHeader from "@/components/utilities/layout-header";

interface FeaturedDesignsLayoutProps {
    children: React.ReactNode;
}

export default function FeaturedDesignsLayout({
    children,
}: FeaturedDesignsLayoutProps) {
    return (
        <LayoutHeader
            heading="Featured Designs"
            description="Explore our most popular and trending custom phone case
                    designs, created and shared by our customers. Get inspired
                    and customize your own case today."
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
