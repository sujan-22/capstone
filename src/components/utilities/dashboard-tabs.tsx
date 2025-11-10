"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Package,
    Receipt,
    Images as ImagesIcon,
} from "lucide-react";

const NAV = [
    { slug: "overview", label: "Overview", icon: LayoutDashboard },
    { slug: "customers", label: "Customers", icon: Users },
    { slug: "catalog", label: "Catalog", icon: Package },
    { slug: "orders", label: "Orders", icon: Receipt },
    { slug: "images", label: "Images", icon: ImagesIcon },
] as const;

export default function AdminSubnav({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Admin sections"
            className={cn("relative -mx-1 overflow-x-auto", className)}
        >
            <ul className="min-w-max flex gap-1 p-1 rounded-lg border bg-background">
                {NAV.map(({ slug, label, icon: Icon }) => {
                    const href = `/admin-dashboard/${slug}`;
                    const active = pathname.startsWith(href);
                    return (
                        <li key={slug}>
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                                    "transition-colors rounded-lg",
                                    active
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground/80 hover:bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="capitalize">{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* <span className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <span className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" /> */}
        </nav>
    );
}
