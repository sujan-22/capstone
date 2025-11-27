"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons/lib";

type Item = { href: string; title: string; icon?: IconType };

export function AccountSidebar({
    className,
    items,
    ...props
}: React.HTMLAttributes<HTMLElement> & { items: Item[] }) {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Account navigation"
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
            data-testid="Account navigation"
        >
            {items.map(({ href, title, icon: Icon }) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            active
                                ? "bg-muted font-medium"
                                : "hover:bg-muted/60",
                            "focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                        prefetch
                    >
                        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                        <span className="truncate">{title}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
