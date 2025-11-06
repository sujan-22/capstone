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
import { IUser } from "../../../auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

export function UserDropdown({ user }: { user: IUser | null | undefined }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const MY_ACCOUNT_LINKS = [
        { label: "Account", href: "/account" },
        { label: "Profile", href: "/account/profile" },
        { label: "Orders", href: "/account/orders" },
    ];

    const USER_MENU_LINKS = [
        { label: "Image Gallery", href: "/gallery-images" },
        { label: "Featured Designs", href: "/featured-designs" },
    ];

    const ADMIN_DASHBOARD_LINKS = [
        { label: "Admin Dashboard", href: "/admin-dashboard/overview" },
    ];

    const { signOut } = useSignOut();
    return (
        <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
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
                                alt={`${
                                    user.name || user.username || "User"
                                } profile picture`}
                                fill
                                sizes="32px"
                                priority
                                referrerPolicy="no-referrer"
                                className="object-cover"
                            />
                        ) : (
                            <span className="flex w-full h-full items-center justify-center text-[11px] font-semibold bg-muted text-muted-foreground">
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
                    <MdKeyboardArrowDown
                        className={`w-5 h-5 transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                    />
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {MY_ACCOUNT_LINKS.map((item) => {
                        return (
                            <DropdownMenuItem
                                key={item.href}
                                onClick={() => router.push(item.href)}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="sm:hidden">
                    Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                    className="sm:hidden"
                    onClick={() => router.push("/configure/upload")}
                >
                    Create Case
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {USER_MENU_LINKS.map((item) => {
                        return (
                            <DropdownMenuItem
                                key={item.href}
                                onClick={() => router.push(item.href)}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {user?.role === "admin" && (
                    <>
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            {ADMIN_DASHBOARD_LINKS.map((item) => {
                                return (
                                    <DropdownMenuItem
                                        key={item.href}
                                        onClick={() => router.push(item.href)}
                                    >
                                        {item.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={async () => {
                        if (user) {
                            await signOut();
                        } else {
                            router.push("/sign-in");
                        }
                    }}
                >
                    {user ? `Sign out` : `Sign in`}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
