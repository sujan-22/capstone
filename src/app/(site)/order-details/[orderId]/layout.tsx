import LayoutHeader from "@/components/utilities/layout-header";

interface FeaturedDesignsLayoutProps {
    children: React.ReactNode;
}

export default function FeaturedDesignsLayout({
    children,
}: FeaturedDesignsLayoutProps) {
    return (
        <LayoutHeader
            heading="Order Details"
            description="View the specifics of your order, including items purchased,
                    shipping information, and order status."
        >
            <div className="flex-1">{children}</div>
        </LayoutHeader>
    );
}
