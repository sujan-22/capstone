import LayoutHeader from "@/components/utilities/layout-header";

interface OrderDetailsLayoutProps {
    children: React.ReactNode;
}

export default function OrderDetailsLayout({
    children,
}: OrderDetailsLayoutProps) {
    return (
        <LayoutHeader
            eyebrow="Order details"
            heading="Your order"
            description="Everything about this order: the case you designed, where it's going, its status and what you paid."
        >
            {children}
        </LayoutHeader>
    );
}
