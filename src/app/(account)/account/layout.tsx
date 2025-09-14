"use client";

import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { AccountSidebar } from "./components/account-sidebar";

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

    return (
        <>
            <div className="space-y-6 p-10 px-0 pb-16 md:block">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Your Account Settings
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Customize your profile, manage preferences, and keep
                        track of your account activity.
                    </p>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
                    {/* Sidebar for larger screens */}
                    <aside className="hidden space-y-8 lg:block lg:w-1/5">
                        <AccountSidebar items={sidebarNavItems} />
                    </aside>

                    {/* Dropdown for smaller screens */}
                    <div className="block lg:hidden mb-6">
                        <Select
                            onValueChange={(value) => router.push(value)}
                            defaultValue={sidebarNavItems[0].href}
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

                    {/* Main content */}
                    <div className="flex-1 lg:max-w-full">{children}</div>
                </div>
            </div>
        </>
    );
}
