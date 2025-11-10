import AdminSubnav from "@/components/utilities/dashboard-tabs";
// import DashboardTabs from "@/components/utilities/dashboard-tabs";
import LayoutHeader from "@/components/utilities/layout-header";

interface AdminDashboardLayoutProps {
    children: React.ReactNode;
}

export default function AdminDashboardLayout({
    children,
}: AdminDashboardLayoutProps) {
    return (
        <LayoutHeader
            heading="Admin Dashboard"
            description="Manage customers, products, and orders from a single dashboard.
                        Use the tabs below to navigate through different sections."
        >
            <AdminSubnav className="mb-2" />
            <div className="flex-1">{children}</div>
        </LayoutHeader>
    );
}
