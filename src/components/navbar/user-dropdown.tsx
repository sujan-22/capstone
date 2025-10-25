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
import { FaUserAlt } from "react-icons/fa";
import { IUser } from "../../../auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState } from "react";

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
                <div className="flex items-center hover:cursor-pointer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full overflow-hidden"
                    >
                        {user && user.image ? (
                            <span className="block w-8 h-8 relative rounded-full border border-blue-600">
                                <Image
                                    src={user.image}
                                    alt={`${
                                        user.name || user.username || "User"
                                    } profile picture`}
                                    fill
                                    sizes="32px"
                                    priority
                                    referrerPolicy="no-referrer"
                                    className="rounded-full object-cover"
                                />
                            </span>
                        ) : (
                            <FaUserAlt className="w-5 h-5" />
                        )}
                    </Button>
                    {isOpen ? (
                        <MdKeyboardArrowDown className="w-5 h-5 rotate-180 transition-transform" />
                    ) : (
                        <MdKeyboardArrowDown className="w-5 h-5 transition-transform" />
                    )}
                </div>
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
