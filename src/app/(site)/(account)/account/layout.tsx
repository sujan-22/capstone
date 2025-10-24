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

const sidebarNavItems = [
    {
        title: "Overview",
        href: "/account",
    },
    {
        title: "Profile",
        href: "/account/profile",
    },
    {
        title: "Orders",
        href: "/account/orders",
    },
    {
        title: "Favorite Designs",
        href: "/account/favorite-designs",
    },
    {
        title: "Reminders",
        href: "/account/reminders",
    },
    {
        title: "Unfinished Designs",
        href: "/account/unfinished-designs",
    },
];

interface SettingsLayoutClientProps {
    children: React.ReactNode;
}

export default function SettingsLayoutClient({
    children,
}: SettingsLayoutClientProps) {
    const router = useRouter();
    const pathName = usePathname();

    return (
        <>
            <LayoutHeader
                heading="Your Account Settings"
                description="Customize your profile, manage preferences, and keep
                        track of your account activity."
            >
                <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="hidden space-y-8 lg:block lg:w-1/5">
                        <AccountSidebar items={sidebarNavItems} />
                    </aside>
                    <div className="block lg:hidden mb-6">
                        <Select
                            onValueChange={(value) => router.push(value)}
                            defaultValue={pathName}
                        >
                            <SelectTrigger>
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
