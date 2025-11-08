"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const TABS = ["overview", "customers", "catalog", "orders", "images"] as const;
const BASE = "/admin-dashboard";

export default function DashboardTabs() {
    const router = useRouter();
    const pathname = usePathname();

    const active = useMemo(() => {
        const parts = pathname.split("/").filter(Boolean);
        const i = parts.indexOf("admin-dashboard");
        const seg = parts[i + 1];
        return (TABS as readonly string[]).includes(seg ?? "")
            ? (seg as string)
            : "overview";
    }, [pathname]);

    const go = (tab: string) => {
        router.push(`${BASE}/${tab}`);
    };

    return (
        <Tabs value={active} onValueChange={go} className="w-full">
            <TabsList className="flex flex-wrap w-full">
                {TABS.map((t) => (
                    <TabsTrigger
                        key={t}
                        value={t}
                        className="hover:cursor-pointer capitalize"
                    >
                        {t}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
