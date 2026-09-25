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
            eyebrow="Featured designs"
            heading="Designed by customers, ready to print."
            description="Our most-loved cases, designed and shared by customers. Buy one as it is, or save it to your favourites and make it yours."
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
