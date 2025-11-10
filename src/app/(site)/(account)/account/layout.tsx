"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { AccountSidebar } from "./components/account-sidebar";
import LayoutHeader from "@/components/utilities/layout-header";
import { Home, User, ShoppingBag, Heart, Bell, FileClock } from "lucide-react";

const sidebarNavItems = [
    { title: "Overview", href: "/account", icon: Home },
    { title: "Profile", href: "/account/profile", icon: User },
    { title: "Orders", href: "/account/orders", icon: ShoppingBag },
    {
        title: "Favorite Designs",
        href: "/account/favorite-designs",
        icon: Heart,
    },
    { title: "Reminders", href: "/account/reminders", icon: Bell },
    {
        title: "Unfinished Designs",
        href: "/account/unfinished-designs",
        icon: FileClock,
    },
];

interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    const router = useRouter();
    const pathName = usePathname();

    return (
        <>
            <LayoutHeader
                heading="Your Account Settings"
                description="Track orders & favorites, manage reminders, resume unfinished designs, and update your profile information."
            >
                <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="hidden space-y-8 lg:block lg:w-1/5 lg:pr-5 lg:border-r">
                        <AccountSidebar items={sidebarNavItems} />
                    </aside>
                    <div className="block lg:hidden mb-6">
                        <Select
                            onValueChange={(value) => router.push(value)}
                            defaultValue={pathName}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a page" />
                            </SelectTrigger>
                            <SelectContent>
                                {sidebarNavItems.map((item) => (
                                    <SelectItem
                                        key={item.href}
                                        value={item.href}
                                    >
                                        {item.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 lg:max-w-full">{children}</div>
                </div>
            </LayoutHeader>
        </>
    );
}
