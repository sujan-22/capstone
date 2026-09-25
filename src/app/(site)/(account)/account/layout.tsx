"use client";

import { AccountSidebar } from "./components/account-sidebar";
import LayoutHeader from "@/components/utilities/layout-header";

const sidebarNavItems = [
    { title: "Overview", href: "/account" },
    { title: "Profile", href: "/account/profile" },
    { title: "Orders", href: "/account/orders" },
    { title: "Favourites", href: "/account/favorite-designs" },
    { title: "Reminders", href: "/account/reminders" },
    { title: "Unfinished designs", href: "/account/unfinished-designs" },
];

interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <LayoutHeader
            eyebrow="Your account"
            heading="Your account"
            description="Track orders and favourites, pick up unfinished designs, manage reminders and keep your profile up to date."
        >
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                <aside className="min-w-0 lg:col-span-3">
                    <AccountSidebar items={sidebarNavItems} />
                </aside>
                <div className="min-w-0 lg:col-span-9">{children}</div>
            </div>
        </LayoutHeader>
    );
}
