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
    { slug: "orders", label: "Orders", icon: Receipt },
    { slug: "customers", label: "Customers", icon: Users },
    { slug: "catalog", label: "Catalog", icon: Package },
    { slug: "images", label: "Images", icon: ImagesIcon },
] as const;

/**
 * Admin section navigation. Vertical in the desktop sidebar, a scrolling row
 * of pills in the mobile top bar. Both sit on ink.
 */
export default function AdminSubnav({
    className,
    orientation = "vertical",
}: {
    className?: string;
    orientation?: "vertical" | "horizontal";
}) {
    const pathname = usePathname();
    const vertical = orientation === "vertical";

    return (
        <nav aria-label="Admin sections" className={className}>
            <ul
                className={cn(
                    vertical
                        ? "flex flex-col gap-0.5"
                        : "scrollbar-none flex gap-1.5 overflow-x-auto"
                )}
            >
                {NAV.map(({ slug, label, icon: Icon }, i) => {
                    const href = `/admin-dashboard/${slug}`;
                    const active = pathname.startsWith(href);
                    return (
                        <li key={slug} className="shrink-0">
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "group flex items-center gap-3 text-sm font-medium transition-colors",
                                    vertical
                                        ? "rounded-lg px-3 py-2.5"
                                        : "rounded-full px-3.5 py-1.5",
                                    active
                                        ? "bg-paper text-ink"
                                        : "text-paper/70 hover:bg-paper/[0.07] hover:text-paper"
                                )}
                            >
                                <Icon
                                    aria-hidden
                                    className={cn(
                                        "size-4 shrink-0",
                                        active ? "text-cobalt" : "text-paper/60"
                                    )}
                                />
                                <span>{label}</span>
                                {vertical ? (
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "type-label ml-auto",
                                            active ? "text-ink-soft" : "text-paper/40"
                                        )}
                                    >
                                        0{i + 1}
                                    </span>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
