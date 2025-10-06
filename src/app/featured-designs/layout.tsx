import { Separator } from "@/components/ui/separator";
import SortSidebar from "./components/sort-sidebar";
import { Suspense } from "react";

interface FeaturedDesignsLayoutProps {
    children: React.ReactNode;
}

export default function FeaturedDesignsLayout({
    children,
}: FeaturedDesignsLayoutProps) {
    return (
        <div className="space-y-6 p-10 px-0 pb-16">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-semibold">Featured Designs</h2>
                <p className="text-muted-foreground text-sm">
                    Explore our most popular and trending custom phone case
                    designs, created and shared by our customers. Get inspired
                    and customize your own case today.
                </p>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col [@media(min-width:620px)]:flex-row-reverse [@media(min-width:620px)]:space-x-12 [@media(min-width:620px)]:space-y-0 gap-2">
                <aside className="mb-4 [@media(min-width:620px)]:mb-0 space-y-8 m-0">
                    <Suspense>
                        <SortSidebar />
                    </Suspense>
                </aside>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
