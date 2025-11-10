// src/components/navbar/user-dropdown.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Badge } from "@/components/ui/badge";
import { useSignOut } from "@/hooks/use-sign-out";
import { getActiveHref, getInitials } from "@/lib/utils";
import { IUser } from "../../../auth-client";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
    User as UserIcon,
    UserCircle,
    ShoppingBag,
    LayoutDashboard,
    ImageIcon,
    Star,
    LogOut,
    Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MY_ACCOUNT_LINKS = [
    { label: "Account", href: "/account", icon: UserIcon },
    { label: "Profile", href: "/account/profile", icon: UserCircle },
    { label: "Orders", href: "/account/orders", icon: ShoppingBag },
] as const;

const USER_MENU_LINKS = [
    { label: "Image Gallery", href: "/gallery-images", icon: ImageIcon },
    { label: "Featured Designs", href: "/featured-designs", icon: Star },
] as const;

const ADMIN_LINKS = [
    {
        label: "Admin Dashboard",
        href: "/admin-dashboard/overview",
        icon: LayoutDashboard,
    },
] as const;

function MenuLink({
    href,
    children,
    active,
}: {
    href: string;
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <DropdownMenuItem asChild aria-current={active ? "page" : undefined}>
            <Link
                href={href}
                className={cn(
                    "flex w-full items-center gap-2",
                    active && "bg-muted/60 font-medium"
                )}
                prefetch
            >
                {children}
            </Link>
        </DropdownMenuItem>
    );
}

export function UserDropdown({ user }: { user: IUser | null | undefined }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { signOut } = useSignOut();
    const accountHrefs = MY_ACCOUNT_LINKS.map((l) => l.href);
    const exploreHrefs = USER_MENU_LINKS.map((l) => l.href);
    const adminHrefs = ADMIN_LINKS.map((l) => l.href);

    const activeAccount = getActiveHref(pathname ?? "", accountHrefs);
    const activeExplore = getActiveHref(pathname ?? "", exploreHrefs);
    const activeAdmin = getActiveHref(pathname ?? "", adminHrefs);

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-10 py-0 pl-1 pr-2 rounded-full gap-2 hover:bg-accent/60 data-[state=open]:bg-accent"
                    aria-expanded={isOpen}
                    aria-label="Open user menu"
                >
                    <span className="relative inline-flex w-8 h-8 rounded-full ring-1 ring-border overflow-hidden">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt=""
                                fill
                                sizes="32px"
                                priority
                                referrerPolicy="no-referrer"
                                className="object-cover"
                            />
                        ) : (
                            // decorative initials only
                            <span
                                aria-hidden
                                className="flex w-full h-full items-center justify-center text-[11px] font-semibold bg-muted text-muted-foreground"
                            >
                                {getInitials(user)}
                            </span>
                        )}
                    </span>
                    <span className="hidden sm:flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium leading-none truncate max-w-[9rem]">
                            {user?.name || user?.username || "Guest"}
                        </span>
                        <span className="text-xs text-muted-foreground leading-none truncate max-w-[9rem]">
                            {user?.email}
                        </span>
                    </span>
                    {user?.role ? (
                        <Badge
                            variant="secondary"
                            className="hidden md:inline-flex h-5 text-[10px]"
                        >
                            {user.role}
                        </Badge>
                    ) : null}
                    <MdKeyboardArrowDown
                        className={cn(
                            "w-5 h-5 transition-transform",
                            isOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                    />
                    <span className="sr-only">
                        {isOpen ? "Close user menu" : "Open user menu"}
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-64"
                align="end"
                sideOffset={8}
                collisionPadding={8}
            >
                <DropdownMenuLabel className="flex items-center gap-2">
                    <span className="sr-only">
                        {user?.name || user?.username || "User"} menu
                    </span>
                    <span
                        aria-hidden
                        className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >
                        {getInitials(user)}
                    </span>
                    <span className="truncate">
                        {user?.name || user?.username || "Guest"}
                    </span>
                </DropdownMenuLabel>

                <DropdownMenuGroup>
                    {MY_ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                        <MenuLink
                            key={href}
                            href={href}
                            active={href === activeAccount}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </MenuLink>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Mobile-only quick action */}
                <DropdownMenuItem
                    className="sm:hidden"
                    onClick={() => router.push("/configure/upload")}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Case
                </DropdownMenuItem>

                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {USER_MENU_LINKS.map(({ href, label, icon: Icon }) => (
                        <MenuLink
                            key={href}
                            href={href}
                            active={href === activeExplore}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </MenuLink>
                    ))}
                </DropdownMenuGroup>

                {user?.role === "admin" && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
                                <MenuLink
                                    key={href}
                                    href={href}
                                    active={href === activeAdmin}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                </MenuLink>
                            ))}
                        </DropdownMenuGroup>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        if (user) await signOut();
                        else router.push("/sign-in");
                    }}
                    className={cn(
                        user ? "text-destructive focus:text-destructive" : "",
                        "cursor-pointer"
                    )}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    {user ? "Sign out" : "Sign in"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
