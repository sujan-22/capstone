"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; title: string };

export function AccountSidebar({
    className,
    items,
    ...props
}: React.HTMLAttributes<HTMLElement> & { items: Item[] }) {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Account navigation"
            className={cn("lg:sticky lg:top-24", className)}
            {...props}
            data-testid="Account navigation"
        >
            <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-ink lg:px-0">
                {items.map(({ href, title }, i) => {
                    const active = pathname === href;
                    return (
                        <li key={href} className="shrink-0">
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                prefetch
                                className={cn(
                                    "group flex items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                                    "lg:rounded-none lg:border-0 lg:border-b lg:border-rule lg:px-0 lg:py-3.5 lg:text-[0.9375rem]",
                                    active
                                        ? "border-ink bg-ink text-paper lg:bg-transparent lg:text-ink"
                                        : "border-rule text-ink-soft hover:text-ink"
                                )}
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        "type-label hidden lg:inline",
                                        active ? "text-cobalt" : "text-ink-soft"
                                    )}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className={cn(active && "lg:font-semibold")}>
                                    {title}
                                </span>
                                <ArrowRight
                                    aria-hidden
                                    className={cn(
                                        "ml-auto hidden size-4 transition-all duration-300 ease-out-expo lg:block",
                                        active
                                            ? "text-cobalt opacity-100"
                                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                    )}
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
