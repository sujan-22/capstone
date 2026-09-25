"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { IUser } from "../../../auth-client";
import MaxWidthWrapper from "../utilities/max-width-wrapper";
import Logo from "../utilities/logo";
import { buttonVariants } from "../ui/button";
import { UserDropdown } from "./user-dropdown";
import { cn, getActiveHref } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Gallery", href: "/gallery-images" },
    { label: "Featured designs", href: "/featured-designs" },
] as const;

const Navbar = ({ user }: { user: IUser | null | undefined }) => {
    const pathname = usePathname() ?? "";
    const active = getActiveHref(
        pathname,
        NAV_LINKS.map((l) => l.href)
    );

    return (
        <header className="sticky top-0 z-40 border-b border-rule bg-paper/80 backdrop-blur-md">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
            >
                Skip to content
            </a>
            <MaxWidthWrapper>
                <nav
                    aria-label="Main"
                    className="flex h-16 items-center gap-3 sm:gap-4"
                >
                    <Logo />

                    <ul className="ml-5 hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={
                                        active === link.href ? "page" : undefined
                                    }
                                    className={cn(
                                        "rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                                        active === link.href &&
                                            "bg-ink/[0.06] text-ink"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                        {user?.role === "admin" ? null : user ? (
                            <Link
                                href="/configure/upload"
                                className={cn(
                                    buttonVariants({ size: "sm" }),
                                    "hidden h-9 px-4 sm:inline-flex"
                                )}
                            >
                                Create a case
                                <ArrowRight
                                    aria-hidden
                                    className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                                />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className={cn(
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "sm",
                                        }),
                                        "h-9 px-3.5"
                                    )}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href={`/sign-in?redirectTo=${encodeURIComponent(
                                        "/configure/upload"
                                    )}`}
                                    className={cn(
                                        buttonVariants({ size: "sm" }),
                                        "hidden h-9 px-4 sm:inline-flex"
                                    )}
                                >
                                    Create a case
                                    <ArrowRight
                                        aria-hidden
                                        className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                                    />
                                </Link>
                            </>
                        )}
                        <UserDropdown user={user} />
                    </div>
                </nav>
            </MaxWidthWrapper>
        </header>
    );
};

export default Navbar;
