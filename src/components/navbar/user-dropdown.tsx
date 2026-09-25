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
import { useSignOut } from "@/hooks/use-sign-out";
import { getActiveHref, getInitials } from "@/lib/utils";
import { IUser } from "../../../auth-client";
import {
    User as UserIcon,
    UserCircle,
    ShoppingBag,
    LayoutDashboard,
    ImageIcon,
    Star,
    LogOut,
    LogIn,
    Plus,
    ChevronDown,
    Menu,
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
                    active && "bg-ink/[0.06] font-medium text-ink"
                )}
                prefetch
            >
                {children}
            </Link>
        </DropdownMenuItem>
    );
}

function Avatar({
    user,
    size,
}: {
    user: IUser | null | undefined;
    size: number;
}) {
    return (
        <span
            className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-cobalt text-white ring-1 ring-ink/10"
            style={{ width: size, height: size }}
        >
            {user?.image ? (
                <Image
                    src={user.image}
                    alt=""
                    fill
                    sizes={`${size}px`}
                    referrerPolicy="no-referrer"
                    className="object-cover"
                />
            ) : (
                <span
                    aria-hidden
                    className="flex size-full items-center justify-center text-[11px] font-bold tracking-wide"
                >
                    {getInitials(user)}
                </span>
            )}
        </span>
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

    const displayName = user?.name || user?.username || "Guest";

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-10 gap-2 py-0 pl-1 pr-2.5 data-[state=open]:bg-ink/[0.06]"
                    aria-expanded={isOpen}
                    aria-label={user ? "Open account menu" : "Open menu"}
                >
                    {user ? (
                        <Avatar user={user} size={32} />
                    ) : (
                        <span className="flex size-8 items-center justify-center rounded-full border border-ink/15">
                            <Menu className="size-4" aria-hidden />
                        </span>
                    )}
                    {user ? (
                        <span className="hidden max-w-[9rem] truncate text-sm font-medium sm:block">
                            {displayName}
                        </span>
                    ) : null}
                    <ChevronDown
                        className={cn(
                            "size-4 text-ink-soft transition-transform duration-300",
                            isOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-72"
                align="end"
                sideOffset={10}
                collisionPadding={12}
            >
                {user ? (
                    <>
                        <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-2">
                            <Avatar user={user} size={36} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    {displayName}
                                </p>
                                <p className="truncate text-xs text-ink-soft">
                                    {user.email}
                                </p>
                            </div>
                            {user.role ? (
                                <span className="type-label rounded-full border border-rule px-2 py-0.5 text-[0.625rem]">
                                    {user.role}
                                </span>
                            ) : null}
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            {MY_ACCOUNT_LINKS.map(
                                ({ href, label, icon: Icon }) => (
                                    <MenuLink
                                        key={href}
                                        href={href}
                                        active={href === activeAccount}
                                    >
                                        <Icon aria-hidden />
                                        <span>{label}</span>
                                    </MenuLink>
                                )
                            )}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />
                    </>
                ) : null}

                {user?.role !== "admin" ? (
                    <>
                        <DropdownMenuItem
                            className="font-semibold text-cobalt focus:text-cobalt sm:hidden [&_svg]:text-cobalt"
                            onClick={() => router.push("/configure/upload")}
                        >
                            <Plus aria-hidden />
                            Create a case
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="sm:hidden" />
                    </>
                ) : null}

                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {USER_MENU_LINKS.map(({ href, label, icon: Icon }) => (
                        <MenuLink
                            key={href}
                            href={href}
                            active={href === activeExplore}
                        >
                            <Icon aria-hidden />
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
                                    <Icon aria-hidden />
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
                        "cursor-pointer",
                        user &&
                            "text-destructive focus:text-destructive [&_svg]:text-destructive"
                    )}
                >
                    {user ? <LogOut aria-hidden /> : <LogIn aria-hidden />}
                    {user ? "Sign out" : "Sign in"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
